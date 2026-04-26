"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { revalidatePath } from "next/cache"

// ─── Gemini Client ─────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ─── Rate Limiters ─────────────────────────────────────────
// Free users: 3 scans per day
const freeScanLimit = new Ratelimit({
  redis:     Redis.fromEnv(),
  limiter:   Ratelimit.slidingWindow(5, "1 d"),
  analytics: true,
  prefix:    "mise:pantry_scan_free",
})

// Pro users: 50 scans per day
const proScanLimit = new Ratelimit({
  redis:     Redis.fromEnv(),
  limiter:   Ratelimit.slidingWindow(50, "1 d"),
  analytics: true,
  prefix:    "mise:pantry_scan_pro",
})

// ─── Types ─────────────────────────────────────────────────
type ScannedIngredient = {
  name:       string
  quantity:   string
  confidence: number
}

// ─── Helper: get DB user ────────────────────────────────────
async function getDbUser() {
  const { userId } = await auth()
  if (!userId) return null
  return db.user.findUnique({ where: { clerkId: userId } })
}

// ─── ACTION 1: Scan Pantry Image ────────────────────────────
export async function scanPantryImage(formData: FormData) {
  try {
    // 1. Auth check
    const user = await getDbUser()
    if (!user) {
      return { success: false, error: "Please sign in to scan your pantry" }
    }

    const isPro = user.subscriptionTier === "PRO"

    // 2. Rate limit check
    const limiter = isPro ? proScanLimit : freeScanLimit
    const { success: withinLimit, remaining } = await limiter.limit(user.id)

    if (!withinLimit) {
      return {
        success:     false,
        rateLimited: true,
        error:       isPro
          ? "You've reached your daily scan limit (50). Try again tomorrow."
          : "Daily scan limit reached (3/day). Upgrade to Pro for 50 scans/day!",
      }
    }

    // 3. Get image from form data
    const imageFile = formData.get("image") as File | null
    if (!imageFile) {
      return { success: false, error: "No image provided" }
    }

    // 4. Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(imageFile.type)) {
      return { success: false, error: "Please upload a JPG, PNG, or WebP image" }
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return { success: false, error: "Image must be under 10MB" }
    }

    // 5. Convert to base64 for Gemini
    const bytes      = await imageFile.arrayBuffer()
    const buffer     = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")

    // 6. Call Gemini Vision
    const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"] // fallback order
    let lastError: Error | null = null
    let responseText: string | null = ""

    const prompt = `
      You are a professional chef and ingredient recognition expert. Analyze this image of a pantry/fridge and identify all visible food ingredients.

      Return ONLY a valid JSON array with this exact structure (no markdown, no explanations):
      [
        {
          "name": "ingredient name",
          "quantity": "estimated quantity with unit",
          "confidence": 0.95
        }
      ]

      Rules:
      - Only identify food ingredients (not containers, utensils, or packaging)
      - Be specific (e.g., "Cheddar Cheese" not just "Cheese")
      - Estimate realistic quantities (e.g., "3 eggs", "1 cup milk", "2 tomatoes")
      - Confidence should be 0.7-1.0 (omit items below 0.7 confidence)
      - Maximum 20 items
      - Common pantry staples are acceptable (salt, pepper, oil)
      - Return ONLY the JSON array, nothing else
      `


    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: imageFile.type as "image/jpeg" | "image/png" | "image/webp",
              data:     base64Image,
            },
          },
        ])
        responseText = result.response.text()
        break // success — stop trying other models
      } catch (err) {
        lastError = err instanceof Error ? err : new Error("Model failed")
        console.error(`Model ${modelName} failed:`, lastError.message)
        // try next model
        continue
      }
    }

    if (!responseText) {
      // All models failed
      const isOverloaded = lastError?.message?.toLowerCase().includes("overload")
        || lastError?.message?.toLowerCase().includes("unavailable")
        || lastError?.message?.toLowerCase().includes("quota")

      return {
        success: false,
        error: isOverloaded
          ? "AI service is busy right now. Please try again in a few minutes."
          : "Failed to analyse image. Please try again.",
      }
    }

    // 7. Parse Gemini response
    let ingredients: ScannedIngredient[]
    try {
      const cleaned = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      ingredients = JSON.parse(cleaned) as ScannedIngredient[]
    } catch {
      return {
        success: false,
        error: "Failed to parse ingredients from image. Please try a clearer photo.",
      }
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return {
        success: false,
        error: "No ingredients detected. Please try a clearer photo of your fridge or pantry.",
      }
    }

    return {
      success:     true,
      ingredients: ingredients.slice(0, 20),
      remaining,
      message:     `Found ${ingredients.length} ingredients!`,
    }
  } catch (error) {
    console.error("scanPantryImage error:", error)
    return {
      success: false,
      error:   error instanceof Error ? error.message : "Failed to scan image",
    }
  }
}

// ─── ACTION 2: Save Scanned Ingredients to Pantry ──────────
export async function saveToPantry(formData: FormData) {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, error: "Please sign in" }
    }

    const ingredientsJson = formData.get("ingredients") as string
    if (!ingredientsJson) {
      return { success: false, error: "No ingredients provided" }
    }

    const ingredients: ScannedIngredient[] = JSON.parse(ingredientsJson)

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return { success: false, error: "No ingredients to save" }
    }

    // Batch create all pantry items
    await db.pantryItem.createMany({
      data: ingredients.map((ing) => ({
        name:     ing.name,
        quantity: ing.quantity,
        userId:   user.id,
      })),
      skipDuplicates: false,
    })

    revalidatePath("/pantry")

    return {
      success: true,
      count:   ingredients.length,
      message: `Saved ${ingredients.length} items to your pantry!`,
    }
  } catch (error) {
    console.error("saveToPantry error:", error)
    return {
      success: false,
      error:   error instanceof Error ? error.message : "Failed to save items",
    }
  }
}

// ─── ACTION 3: Add Single Pantry Item Manually ─────────────
export async function addPantryItemManually(formData: FormData) {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, error: "Please sign in" }
    }

    const name     = formData.get("name") as string
    const quantity = formData.get("quantity") as string
    const unit     = formData.get("unit") as string | null

    if (!name?.trim()) {
      return { success: false, error: "Ingredient name is required" }
    }

    const item = await db.pantryItem.create({
      data: {
        name:     name.trim(),
        quantity: quantity?.trim() || null,
        unit:     unit?.trim()     || null,
        userId:   user.id,
      },
    })

    revalidatePath("/pantry")

    return { success: true, item }
  } catch (error) {
    console.error("addPantryItemManually error:", error)
    return {
      success: false,
      error:   error instanceof Error ? error.message : "Failed to add item",
    }
  }
}

// ─── ACTION 4: Get Pantry Items ─────────────────────────────
export async function getPantryItems() {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, items: [], isPro: false, error: "Please sign in" }
    }

    const items = await db.pantryItem.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      items,
      isPro:   user.subscriptionTier === "PRO",
    }
  } catch (error) {
    console.error("getPantryItems error:", error)
    return {
      success: false,
      items:   [],
      isPro:   false,
      error:   error instanceof Error ? error.message : "Failed to load pantry",
    }
  }
}

// ─── ACTION 5: Delete Pantry Item ──────────────────────────
export async function deletePantryItem(formData: FormData) {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, error: "Please sign in" }
    }

    const itemId = formData.get("itemId") as string
    if (!itemId) {
      return { success: false, error: "Item ID is required" }
    }

    // Verify ownership before deleting
    const item = await db.pantryItem.findFirst({
      where: { id: itemId, userId: user.id },
    })

    if (!item) {
      return { success: false, error: "Item not found" }
    }

    await db.pantryItem.delete({ where: { id: itemId } })

    revalidatePath("/pantry")

    return { success: true }
  } catch (error) {
    console.error("deletePantryItem error:", error)
    return {
      success: false,
      error:   error instanceof Error ? error.message : "Failed to delete item",
    }
  }
}

// ─── ACTION 6: Update Pantry Item ──────────────────────────
export async function updatePantryItem(formData: FormData) {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, error: "Please sign in" }
    }

    const itemId   = formData.get("itemId")   as string
    const name     = formData.get("name")     as string
    const quantity = formData.get("quantity") as string
    const unit     = formData.get("unit")     as string | null

    if (!itemId || !name?.trim()) {
      return { success: false, error: "Item ID and name are required" }
    }

    // Verify ownership
    const existing = await db.pantryItem.findFirst({
      where: { id: itemId, userId: user.id },
    })

    if (!existing) {
      return { success: false, error: "Item not found" }
    }

    const updated = await db.pantryItem.update({
      where: { id: itemId },
      data: {
        name:     name.trim(),
        quantity: quantity?.trim() || null,
        unit:     unit?.trim()     || null,
      },
    })

    revalidatePath("/pantry")

    return { success: true, item: updated }
  } catch (error) {
    console.error("updatePantryItem error:", error)
    return {
      success: false,
      error:   error instanceof Error ? error.message : "Failed to update item",
    }
  }
}

// ─── ACTION 7: Clear All Pantry Items ──────────────────────
export async function clearPantry() {
  try {
    const user = await getDbUser()
    if (!user) {
      return { success: false, error: "Please sign in" }
    }

    await db.pantryItem.deleteMany({ where: { userId: user.id } })

    revalidatePath("/pantry")

    return { success: true }
  } catch (error) {
    console.error("clearPantry error:", error)
    return {
      success: false,
      error:   error instanceof Error ? error.message : "Failed to clear pantry",
    }
  }
}