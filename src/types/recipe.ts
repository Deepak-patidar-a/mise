// src/types/recipe.ts

export type Meal = {
  idMeal: string
  strMeal: string
  strMealThumb: string
}

// ─── MealDB recipe (from external API) ────────────────────
export type MealDBRecipe = {
  strMeal:      string
  strMealThumb: string
  idMeal:       string
}

// ─── AI pantry-generated recipe (suggestion only, no DB id) ─
export type PantryRecipe = {
  title:               string
  description?:        string
  category?:           string
  cuisine?:            string
  prepTime?:           number
  cookTime?:           number
  servings?:           number
  matchPercentage:     number
  missingIngredients?: string[]
  imageUrl?:           string
}

// ─── Your DB recipe (Prisma returns null not undefined) ────
export type DBRecipe = {
  id:            string
  title:         string
  description:   string | null   // ← null not undefined
  category:      string | null
  cuisine:       string | null
  prepTime:      number | null
  cookTime:      number | null
  servings:      number | null
  imageUrl:      string | null
  nutrition:     unknown | null
  tips:          unknown | null
  substitutions: unknown | null
  isAiGenerated: boolean
  isPublic:      boolean
  userId:        string
  createdAt:     Date
  updatedAt:     Date
}

export type Recipe   = MealDBRecipe | PantryRecipe | DBRecipe
export type Variant  = "grid" | "pantry" | "list" | "default"


export type Ingredient = {
  item: string;
  amount: string;
  category?: string;
};

export type Instruction = {
  step: number;
  title: string;
  instruction: string;
  tip?: string;
};

export type Substitution = {
  original: string;
  alternatives: string[];
};

export type Nutrition = {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
};

export type RecipeActionResult = {
  success: boolean;
  recipe: Recipe;
  recipeId: string;
  isSaved: boolean;
  fromDatabase: boolean;
  isPro: boolean;
};

export type GeneratedRecipe = {
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

export type PantryRecipeSuggestion = {
  title: string
  description: string
  matchPercentage: number
  missingIngredients: string[]
  cuisine: string
  category: string
  prepTime: number
  cookTime: number
  servings: number
}