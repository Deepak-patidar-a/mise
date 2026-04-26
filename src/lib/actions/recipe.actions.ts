"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import OpenAI from "openai"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { revalidatePath } from "next/cache"
import { GeneratedRecipe, PantryRecipeSuggestion } from "@/types/recipe"

// ─── OpenAI Client ─────────────────────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// ─── Upstash Rate Limiter ──────────────────────────────────
// 3 recipe generations per user per day (free tier only)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 d"),
  analytics: true,
  prefix: "mise:recipe_generation",
})


const pantryRatelimit = new Ratelimit({
  redis:     Redis.fromEnv(),
  limiter:   Ratelimit.slidingWindow(5, "1 d"), // 5 pantry suggestions per day
  analytics: true,
  prefix:    "mise:pantry_suggestions",         // different prefix = separate counter
})

// ─── Helper: get DB user from Clerk session ─────────────────
async function getDbUser() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  })

  return user
}

// ─── Helper 1: Normalize recipe title ──────────────────────
// "apple cake" → "Apple Cake", "PASTA BAKE" → "Pasta Bake"
function normalizeTitle(title: string): string {
  return title
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

// ─── Helper 2: Fetch recipe image from Unsplash ─────────────
async function fetchRecipeImage(recipeName: string): Promise<string> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      console.warn("⚠️ UNSPLASH_ACCESS_KEY not set, skipping image fetch")
      return ""
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        recipeName
      )}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    )

    if (!response.ok) {
      console.error("❌ Unsplash API error:", response.statusText)
      return ""
    }

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular as string
      
      return imageUrl
    }

    
    return ""
  } catch (error) {
    console.error("❌ Error fetching Unsplash image:", error)
    return ""
  }
}

// ─── Helper 3: Build AI prompt ──────────────────────────────
function buildRecipePrompt(recipeName: string): string {
  return `
You are a professional chef and recipe writer. Generate a detailed, accurate recipe for "${recipeName}".

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "title": "${recipeName}",
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
- The "title" field MUST be EXACTLY: "${recipeName}" (no changes)
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
    const rawName = formData.get("recipeName") as string

    if (!rawName?.trim()) {
      return { success: false, error: "Recipe name is required" }
    }

    // Normalize title before anything else
    const recipeName = normalizeTitle(rawName)

    // 1. Check if recipe already exists in DB (case-insensitive)
    const existingRecipe = await db.recipe.findFirst({
      where: {
        title: {
          equals: recipeName,
          mode: "insensitive",
        },
      },
    })

    // 2. If found in DB, return it
    if (existingRecipe) {
      let isSaved = false
      let isPro = false

      if (userId) {
        const user = await db.user.findUnique({
          where: { clerkId: userId },
        })

        if (user) {
          isPro = user.subscriptionTier === "PRO"
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
        isPro,
        fromDatabase: true,
      }
    }

    // 3. Not in DB — require auth before generating
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

    // 4. Rate limit — free users only (PRO users bypass)
    if (user.subscriptionTier !== "PRO") {
      const { success: withinLimit, remaining } = await ratelimit.limit(user.id)

      if (!withinLimit) {
        return {
          success: false,
          error:
            "Daily limit reached. You can generate 3 recipes per day. Upgrade to Pro for unlimited generations.",
          rateLimited: true,
          remaining,
        }
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
      const clean = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      generated = JSON.parse(clean) as GeneratedRecipe
    } catch {
      return { success: false, error: "Failed to parse generated recipe" }
    }

    // Force title to our normalized version (AI sometimes adds words)
    generated.title = recipeName

    // 7. Fetch image from Unsplash
    
    const imageUrl = await fetchRecipeImage(recipeName)

    // 8. Save to DB
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
        imageUrl:      imageUrl,           // ← from Unsplash
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
      isPro: user.subscriptionTier === "PRO",
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
      include: { recipe: true },
      orderBy: { createdAt: "desc" },
    })

    const recipes = savedRecipes.map((sr) => sr.recipe)

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

// ─── ACTION 6: Get Recipes by Pantry Ingredients ──────────
export async function getRecipesByPantryIngredients() {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, recipes: [], error: "Please sign in" }
    }

    // 1. Fetch user's pantry items from DB
    const pantryItems = await db.pantryItem.findMany({
      where: { userId: user.id },
    })

    if (pantryItems.length === 0) {
      return {
        success: false,
        recipes: [],
        error: "Your pantry is empty. Add some ingredients first!",
      }
    }

    // 2. Rate limit — free users only (PRO bypass)
    if (user.subscriptionTier !== "PRO") {
      const { success: withinLimit, remaining } = await pantryRatelimit.limit(user.id)

      if (!withinLimit) {
        return {
          success: false,
          recipes: [],
          error:
            "Daily limit reached. You can get 5 pantry suggestions per day. Upgrade to Pro for unlimited.",
          rateLimited: true,
          remaining,
        }
      }
    }

    // 3. Build ingredient string — include quantity/unit when available
    // e.g. "2 cups flour, 3 eggs, 500g chicken breast, olive oil"
    const ingredientList = pantryItems
      .map((item) => {
        const parts = [item.quantity, item.unit, item.name].filter(Boolean)
        return parts.join(" ")
      })
      .join(", ")


    // 4. Ask OpenAI for recipe suggestions
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional chef. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: buildPantryPrompt(ingredientList),
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      return { success: false, recipes: [], error: "Failed to get suggestions" }
    }

    // 5. Parse response
    let suggestions: PantryRecipeSuggestion[]
    try {
      const clean = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      suggestions = JSON.parse(clean) as PantryRecipeSuggestion[]
    } catch {
      return { success: false, recipes: [], error: "Failed to parse suggestions" }
    }

    return {
      success: true,
      recipes: suggestions,
      ingredientsUsed: ingredientList,
      isPro: user.subscriptionTier === "PRO",
      rateLimited: false,
    }
  } catch (error) {
    console.error("getRecipesByPantryIngredients error:", error)
    return {
      success: false,
      recipes: [],
      error: error instanceof Error ? error.message : "Failed to get pantry suggestions",
    }
  }
}

// ─── Helper: Pantry Prompt ─────────────────────────────────
function buildPantryPrompt(ingredients: string): string {
  return `You are a professional chef helping someone cook with what they have.

The user's pantry contains: ${ingredients}

Suggest exactly 5 different recipes they can realistically make.
Common staples (salt, pepper, oil, water, basic spices) are always assumed available.

Return ONLY a valid JSON array with no markdown or extra text:
[
  {
    "title": "Recipe Name",
    "description": "1-2 sentence appetizing description that makes it sound delicious",
    "matchPercentage": 92,
    "missingIngredients": ["only non-staple items the user is missing"],
    "cuisine": "one of: Indian, Italian, Chinese, Mexican, American, Mediterranean, Asian, Other",
    "category": "one of: Breakfast, Lunch, Dinner, Snack, Dessert",
    "prepTime": 15,
    "cookTime": 25,
    "servings": 4
  }
]

Strict rules:
- matchPercentage must be between 70-100 based on how many user ingredients are used
- Vary the matchPercentage realistically — include some 90%+ and some 70-80% options
- missingIngredients must be empty array [] if the recipe uses only what they have + staples
- All 5 recipes must be from completely different cuisines or meal types — no repetition
- Sort by matchPercentage descending (highest match first)
- prepTime and cookTime must be realistic integers in minutes
- Return ONLY the JSON array, nothing else
`
}

// ─── Enum Mappers ──────────────────────────────────────────
function mapCuisine(cuisine: string): "INDIAN" | "ITALIAN" | "CHINESE" | "MEXICAN" | "OTHER" {
  const map: Record<string, "INDIAN" | "ITALIAN" | "CHINESE" | "MEXICAN" | "OTHER"> = {
    indian:   "INDIAN",
    italian:  "ITALIAN",
    chinese:  "CHINESE",
    mexican:  "MEXICAN",
  }
  return map[cuisine.toLowerCase()] ?? "OTHER"
}

function mapCategory(category: string): "VEG" | "NON_VEG" | "VEGAN" | "DESSERT" | "SNACK" {
  const lower = category.toLowerCase()
  const map: Record<string, "VEG" | "NON_VEG" | "VEGAN" | "DESSERT" | "SNACK"> = {
    veg:          "VEG",
    vegetarian:   "VEG",
    "non-veg":    "NON_VEG",
    "non veg":    "NON_VEG",
    meat:         "NON_VEG",
    "main course":"NON_VEG",
    dinner:       "NON_VEG",
    lunch:        "NON_VEG",
    vegan:        "VEGAN",
    dessert:      "DESSERT",
    snack:        "SNACK",
    breakfast:    "SNACK",
  }
  return map[lower] ?? "VEG"
}