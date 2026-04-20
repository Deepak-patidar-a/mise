// app/(main)/explore/category/[category]/page.tsx
import { getMealsByCategory } from "@/lib/actions/mealdb.actions"
import RecipeGrid from "@/components/RecipeGrid"

type Props = {
  params: Promise<{ category: string }>
}

export default async function CategoryRecipesPage({ params }: Props) {
  const { category } = await params

  const displayName = category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  const result = await getMealsByCategory(displayName)
  const meals = result.success ? result.meals : []

  return (
    <RecipeGrid
      type="category"
      value={displayName}
      meals={meals}
      backLink="/explore"
    />
  )
}