// app/(main)/recipes/[id]/page.tsx
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export default async function MyRecipeDetailPage({ params }: Props) {
  const { id } = await params

  const recipe = await db.recipe.findUnique({
    where: { id },
    select: { title: true }
  })

  if (!recipe) notFound()

  // Redirect to the AI recipe page which already renders DB recipes beautifully
  redirect(`/recipe?cook=${encodeURIComponent(recipe.title)}`)
}