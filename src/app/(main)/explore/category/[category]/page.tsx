"use client";

import { useParams } from "next/navigation";
import { getMealsByCategory } from "@/lib/actions/mealdb.actions";
import RecipeGrid from "@/components/RecipeGrid";

export default function CategoryRecipesPage() {
  const params = useParams();
  const category = params.category as string;

  return (
    <RecipeGrid
      type="category"
      value={category}
      fetchAction={getMealsByCategory}
      backLink="/explore"
    />
  );
}