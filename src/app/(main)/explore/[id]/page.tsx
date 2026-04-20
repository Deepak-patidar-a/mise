// app/(main)/explore/[id]/page.tsx
import MealDetailPage from "@/components/MealDetailPage"
import { getMealById } from "@/lib/actions/mealdb.actions"

import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const result = await getMealById(id)

  if (!result.success || !result.meal) {
    return { title: "Recipe Not Found | Mise" }
  }

  return {
    title: `${result.meal.strMeal} | Mise`,
    description: `Learn how to cook ${result.meal.strMeal}. ${result.meal.strCategory} recipe from ${result.meal.strArea} cuisine.`,
    openGraph: {
      images: [{ url: result.meal.strMealThumb }],
    },
  }
}

export default async function ExploreMealPage({ params }: Props) {
  const { id } = await params
  const result = await getMealById(id)

  if (!result.success || !result.meal) {
    notFound()
  }

  return <MealDetailPage meal={result.meal} />
}