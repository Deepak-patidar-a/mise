"use client";

import { useParams } from "next/navigation";
import { getMealsByArea } from "@/lib/actions/mealdb.actions";
import RecipeGrid from "@/components/RecipeGrid";

export default function CuisineRecipesPage() {
  const params = useParams();
  const cuisine = params.cuisine as string;

  return (
    <RecipeGrid
      type="cuisine"
      value={cuisine}
      fetchAction={getMealsByArea}
      backLink="/explore"
    />
  );
}