// app/(main)/explore/cuisine/[cuisine]/page.tsx
import { getMealsByArea } from "@/lib/actions/mealdb.actions"
import RecipeGrid from "@/components/RecipeGrid"

type Props = {
  params: Promise<{ cuisine: string }>
}

export default async function CuisineRecipesPage({ params }: Props) {
  const { cuisine } = await params

  const displayName = cuisine
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  const result = await getMealsByArea(displayName)
  const meals = result.success ? result.meals : []

  return (
    <RecipeGrid
      type="cuisine"
      value={displayName}
      meals={meals}
      backLink="/explore"
    />
  )
}