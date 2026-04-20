"use client"

import { useEffect } from "react"
import { Bookmark, Loader2, ChefHat } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSavedRecipes } from "@/lib/actions/recipe.actions"
import { useFetch } from "@/hooks/use-fetch"
import RecipeCard from "@/components/RecipeCard"
import type { DBRecipe } from "@/types/recipe"

// ─── Types ─────────────────────────────────────────────────
type SavedRecipesResult = {
  success: boolean
  recipes: DBRecipe[]
  error?: string
}

// ─── Loading Skeleton ───────────────────────────────────────
function RecipeListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl overflow-hidden flex animate-pulse"
        >
          <div className="w-48 aspect-square bg-muted flex-shrink-0" />
          <div className="flex-1 p-5 space-y-3">
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 gap-5 border-2 border-dashed border-border rounded-2xl bg-card">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Bookmark className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-bold text-foreground">
          No saved recipes yet
        </h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          Start exploring recipes and save your favorites to build your
          personal cookbook!
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/explore">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full gap-2 shadow-[0_4px_16px_rgba(232,82,10,0.3)]">
            <ChefHat className="w-4 h-4" />
            Explore Recipes
          </Button>
        </Link>
        <Link href="/pantry">
          <Button
            variant="outline"
            className="rounded-full border-border hover:border-primary hover:text-primary gap-2"
          >
            Check Your Pantry
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────
export default function SavedRecipesPage() {
  const {
    loading,
    data: recipesData,
    fn: fetchSavedRecipes,
  } = useFetch<SavedRecipesResult, []>(getSavedRecipes)

  useEffect(() => {
    fetchSavedRecipes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const recipes = recipesData?.recipes ?? []

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bookmark className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            My Saved Recipes
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Your personal collection of favourite recipes
          </p>
        </div>
      </div>

      {/* Count badge — only when loaded */}
      {!loading && recipes.length > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{recipes.length}</span>{" "}
          {recipes.length === 1 ? "recipe" : "recipes"} saved
        </p>
      )}

      {/* Loading */}
      {loading && <RecipeListSkeleton />}

      {/* Recipe Grid */}
      {!loading && recipes.length > 0 && (
        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              variant="list"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && recipes.length === 0 && <EmptyState />}

    </div>
  )
}