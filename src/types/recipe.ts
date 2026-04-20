// src/types/recipe.ts

export type Meal = {
  idMeal: string
  strMeal: string
  strMealThumb: string
}

export type MealDBRecipe = {
  strMeal: string
  strMealThumb: string
  idMeal: string
}

export type PantryRecipe = {
    id?: string
  title: string
  description?: string
  category?: string
  cuisine?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  matchPercentage: number
  missingIngredients?: string[]
  imageUrl?: string
}

export type DBRecipe = {
    id?: string
  title: string
  description?: string
  category?: string
  cuisine?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  imageUrl?: string
}

export type Recipe = MealDBRecipe | PantryRecipe | DBRecipe
export type Variant = "grid" | "pantry" | "list" | "default"

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