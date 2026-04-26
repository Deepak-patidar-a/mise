"use client"

import { useEffect } from "react"
import {
  ArrowLeft, ChefHat, Sparkles,
  AlertCircle, TrendingUp, Package, RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {useFetch }from "@/hooks/use-fetch"
import { getRecipesByPantryIngredients } from "@/lib/actions/recipe.actions"
import RecipeCard from "@/components/RecipeCard"

// ─── Types ──────────────────────────────────────────────────
type PantryRecipe = {
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

type PantryRecipesResult = {
  success: boolean
  recipes: PantryRecipe[]
  ingredientsUsed?: string
  isPro?: boolean
  rateLimited?: boolean
}

// ─── Loading Skeleton ────────────────────────────────────────
function RecipesSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse"
        >
          <div className="aspect-video bg-muted" />
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <div className="h-5 bg-muted rounded-full w-16" />
              <div className="h-5 bg-muted rounded-full w-20" />
            </div>
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Empty Pantry State ───────────────────────────────────────
function EmptyPantryState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 gap-5 border-2 border-dashed border-border rounded-2xl bg-card">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Your Pantry is Empty
        </h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          Add ingredients to your pantry first so we can suggest delicious
          recipes you can make!
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/pantry">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-full gap-2">
            <Package className="w-4 h-4" />
            Add Ingredients
          </Button>
        </Link>
      </div>
    </div>
  )
}

// ─── Rate Limited State ───────────────────────────────────────
function RateLimitedState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 gap-5 bg-primary/5 border border-primary/15 rounded-2xl">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-bold text-foreground">
          Daily Limit Reached
        </h3>
        <p className="text-muted-foreground max-w-sm text-sm">
          You&apos;ve used all your AI recipe recommendations today.
          Upgrade to Pro for unlimited suggestions!
        </p>
      </div>
      <Button className="bg-primary hover:bg-primary/90 text-white rounded-full gap-2 shadow-[0_4px_16px_rgba(232,82,10,0.3)]">
        <Sparkles className="w-4 h-4" />
        Upgrade to Pro
      </Button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function PantryRecipesPage() {
  const {
    loading,
    data: recipesData,
    fn: fetchSuggestions,
  } = useFetch<PantryRecipesResult, []>(getRecipesByPantryIngredients)

  useEffect(() => {
    fetchSuggestions()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const recipes          = recipesData?.recipes        ?? []
  const ingredientsUsed  = recipesData?.ingredientsUsed ?? ""
  const isRateLimited    = recipesData?.rateLimited     ?? false
  const isEmptyPantry    = recipesData?.success === false && !isRateLimited

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <Link
          href="/pantry"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Pantry
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl font-black text-foreground tracking-tight">
              What Can I Cook?
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              AI-powered recipe suggestions based on your pantry
            </p>
          </div>
        </div>
      </div>

      {/* ── Ingredients Used Strip ───────────────────────────── */}
      {ingredientsUsed && !loading && (
        <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
          <Package className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-0.5">
              Using your ingredients:
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ingredientsUsed}
            </p>
          </div>
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
              <ChefHat className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Finding Perfect Recipes...
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Our AI chef is analyzing your ingredients
              </p>
            </div>
          </div>
          <RecipesSkeleton />
        </div>
      )}

      {/* ── Recipes Grid ─────────────────────────────────────── */}
      {!loading && recipes.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Recipe Suggestions
              </h2>
            </div>
            <Badge
              variant="outline"
              className="border-border text-muted-foreground font-semibold"
            >
              {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
            {recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} variant="pantry" />
            ))}
          </div>

          {/* Refresh */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => fetchSuggestions()}
              variant="outline"
              className="rounded-full border-border hover:border-primary hover:text-primary gap-2"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" />
              Get New Suggestions
            </Button>
          </div>
        </div>
      )}

      {/* ── Empty Pantry ─────────────────────────────────────── */}
      {!loading && isEmptyPantry && <EmptyPantryState />}

      {/* ── Rate Limited ─────────────────────────────────────── */}
      {!loading && isRateLimited && <RateLimitedState />}

    </div>
  )
}