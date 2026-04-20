"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import OpenAI from "openai"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { revalidatePath } from "next/cache"

// ─── OpenAI Client ─────────────────────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// ─── Upstash Rate Limiter ──────────────────────────────────
// 3 recipe generations per user per day
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 d"),
  analytics: true,
  prefix: "mise:recipe_generation",
})

// ─── Types ─────────────────────────────────────────────────
type Ingredient = {
  item: string
  amount: string
  category?: string
}

type Instruction = {
  step: number
  title: string
  instruction: string
  tip?: string
}

type Substitution = {
  original: string
  alternatives: string[]
}

type GeneratedRecipe = {
  title: string
  description: string
  cuisine: string
  category: string
  prepTime: number
  cookTime: number
  servings: number
  ingredients: Ingredient[]
  instructions: Instruction[]
  tips: string[]
  substitutions: Substitution[]
  nutrition: {
    calories: number
    protein: string
    carbs: string
    fat: string
  }
}

// ─── Helper: get or create DB user ─────────────────────────
async function getDbUser() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  })

  return user
}

// ─── Helper: build AI prompt ───────────────────────────────
function buildRecipePrompt(recipeName: string): string {
  return `
You are a professional chef and recipe writer. Generate a detailed, accurate recipe for "${recipeName}".

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "title": "exact recipe name",
  "description": "appetizing 1-2 sentence description",
  "cuisine": "cuisine type (e.g. Italian, Indian, Mexican)",
  "category": "meal category (e.g. Main Course, Dessert, Breakfast)",
  "prepTime": number (minutes),
  "cookTime": number (minutes),
  "servings": number,
  "ingredients": [
    {
      "item": "ingredient name",
      "amount": "quantity with unit",
      "category": "Produce/Protein/Dairy/Pantry/Spices/Other"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "title": "short step title",
      "instruction": "detailed instruction",
      "tip": "optional pro tip for this step or null"
    }
  ],
  "tips": ["general tip 1", "general tip 2", "general tip 3"],
  "substitutions": [
    {
      "original": "ingredient that might be hard to find",
      "alternatives": ["substitute 1", "substitute 2"]
    }
  ],
  "nutrition": {
    "calories": number,
    "protein": "Xg",
    "carbs": "Xg",
    "fat": "Xg"
  }
}

Rules:
- Be specific with measurements (cups, tbsp, grams etc.)
- Include 6-12 ingredients minimum
- Include 5-10 step-by-step instructions
- Include 3 general tips
- Include 2-3 substitutions for less common ingredients
- Nutrition should be per serving
- Return ONLY the JSON, nothing else
`
}

// ─── ACTION 1: Get or Generate Recipe ─────────────────────
export async function getOrGenerateRecipe(formData: FormData) {
  try {
    const { userId } = await auth()
    const recipeName = formData.get("recipeName") as string

    if (!recipeName) {
      return { success: false, error: "Recipe name is required" }
    }

    // 1. Check if recipe already exists in DB
    const existingRecipe = await db.recipe.findFirst({
      where: {
        title: {
          equals: recipeName,
          mode: "insensitive", // case-insensitive match
        },
      },
    })

    // 2. If found in DB, return it
    if (existingRecipe) {
      // Check if current user has saved it
      let isSaved = false
      let isPro = false

      if (userId) {
        const user = await db.user.findUnique({
          where: { clerkId: userId },
        })

        if (user) {
          const saved = await db.savedRecipe.findUnique({
            where: {
              userId_recipeId: {
                userId: user.id,
                recipeId: existingRecipe.id,
              },
            },
          })
          isSaved = !!saved
        }
      }

      return {
        success: true,
        recipe: existingRecipe,
        recipeId: existingRecipe.id,
        isSaved,
        isPro : false,
        fromDatabase: true,
      }
    }

    // 3. Recipe not in DB — check auth before generating
    if (!userId) {
      return {
        success: false,
        error: "Please sign in to generate recipes",
      }
    }

    const user = await getDbUser()
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // 4. Rate limit check (3 generations per day for free users)
      const { success: withinLimit, remaining } = await ratelimit.limit(
        user.id
      )

      if (!withinLimit) {
        return {
          success: false,
          error: "Daily limit reached. You can generate 3 recipes per day. Upgrade to Pro for unlimited generations.",
          rateLimited: true,
          remaining: remaining,
        }
      }

    // 5. Generate recipe with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional chef. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: buildRecipePrompt(recipeName),
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      return { success: false, error: "Failed to generate recipe" }
    }

    // 6. Parse AI response
    let generated: GeneratedRecipe
    try {
      generated = JSON.parse(rawContent) as GeneratedRecipe
    } catch {
      return { success: false, error: "Failed to parse generated recipe" }
    }

    // 7. Save to DB as a public recipe
    const savedRecipe = await db.recipe.create({
      data: {
        title:         generated.title,
        description:   generated.description,
        cuisine:       mapCuisine(generated.cuisine),
        category:      mapCategory(generated.category),
        prepTime:      generated.prepTime,
        cookTime:      generated.cookTime,
        servings:      generated.servings,
        ingredients:   generated.ingredients,
        steps:         generated.instructions,
        tips:          generated.tips,
        substitutions: generated.substitutions,
        nutrition:     generated.nutrition,
        isAiGenerated: true,
        isPublic:      true,
        userId:        user.id,
      },
    })

    return {
      success: true,
      recipe: savedRecipe,
      recipeId: savedRecipe.id,
      isSaved: false,
      isPro: false,
      fromDatabase: false,
    }
  } catch (error) {
    console.error("getOrGenerateRecipe error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    }
  }
}

// ─── ACTION 2: Save Recipe to Collection ──────────────────
export async function saveRecipeToCollection(formData: FormData) {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, error: "Please sign in to save recipes" }
    }

    const recipeId = formData.get("recipeId") as string
    if (!recipeId) {
      return { success: false, error: "Recipe ID is required" }
    }

    // Check if already saved
    const existing = await db.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId,
        },
      },
    })

    if (existing) {
      return { success: true, alreadySaved: true }
    }

    // Save it
    await db.savedRecipe.create({
      data: {
        userId: user.id,
        recipeId,
      },
    })

    revalidatePath("/recipes")

    return { success: true, alreadySaved: false }
  } catch (error) {
    console.error("saveRecipeToCollection error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save recipe",
    }
  }
}

// ─── ACTION 3: Remove Recipe from Collection ──────────────
export async function removeRecipeFromCollection(formData: FormData) {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, error: "Please sign in" }
    }

    const recipeId = formData.get("recipeId") as string
    if (!recipeId) {
      return { success: false, error: "Recipe ID is required" }
    }

    await db.savedRecipe.delete({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId,
        },
      },
    })

    revalidatePath("/recipes")

    return { success: true }
  } catch (error) {
    console.error("removeRecipeFromCollection error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove recipe",
    }
  }
}

// ─── ACTION 4: Get Saved Recipes ──────────────────────────
export async function getSavedRecipes() {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, recipes: [], error: "Please sign in" }
    }

    const savedRecipes = await db.savedRecipe.findMany({
      where: { userId: user.id },
      include: {
        recipe: true, // join with Recipe table
      },
      orderBy: { createdAt: "desc" },
    })

    // Return just the recipe objects
    const recipes = savedRecipes.map((sr : any) => sr.recipe)

    return { success: true, recipes }
  } catch (error) {
    console.error("getSavedRecipes error:", error)
    return {
      success: false,
      recipes: [],
      error: error instanceof Error ? error.message : "Failed to fetch saved recipes",
    }
  }
}

// ─── ACTION 5: Get User's Own Recipes ─────────────────────
export async function getMyRecipes() {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, recipes: [], error: "Please sign in" }
    }

    const recipes = await db.recipe.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, recipes }
  } catch (error) {
    console.error("getMyRecipes error:", error)
    return {
      success: false,
      recipes: [],
      error: error instanceof Error ? error.message : "Failed to fetch recipes",
    }
  }
}

// ─── Enum Mappers ──────────────────────────────────────────
// AI returns free-text cuisine/category — map to your Prisma enums

function mapCuisine(cuisine: string) {
  const map: Record<string, "INDIAN" | "ITALIAN" | "CHINESE" | "MEXICAN" | "OTHER"> = {
    indian:   "INDIAN",
    italian:  "ITALIAN",
    chinese:  "CHINESE",
    mexican:  "MEXICAN",
  }
  return map[cuisine.toLowerCase()] ?? "OTHER"
}

function mapCategory(category: string) {
  const lower = category.toLowerCase()
  const map: Record<string, "VEG" | "NON_VEG" | "VEGAN" | "DESSERT" | "SNACK"> = {
    veg:        "VEG",
    vegetarian: "VEG",
    "non-veg":  "NON_VEG",
    "non veg":  "NON_VEG",
    meat:       "NON_VEG",
    vegan:      "VEGAN",
    dessert:    "DESSERT",
    snack:      "SNACK",
  }
  return map[lower] ?? "VEG"
}