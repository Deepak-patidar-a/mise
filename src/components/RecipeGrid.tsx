// RecipeGrid.tsx — remove fetchAction, accept meals directly
"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import RecipeCard from "./RecipeCard"
import {Meal} from "@/types/recipe"
import { Button } from "@/components/ui/button"

type Props = {
  type: "category" | "cuisine"
  value: string
  meals: Meal[]
  backLink?: string
}

function RecipeCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
      </div>
    </div>
  )
}

export default function RecipeGrid({
  type,
  value,
  meals,
  backLink = "/explore",
}: Props) {
  const entityLabel = type === "cuisine" ? "Cuisine" : "Recipes"
  const itemLabel   = type === "cuisine" ? "dishes"  : "recipes"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <Link
          href={backLink}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Explore
        </Link>

        <div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-foreground capitalize tracking-tight leading-tight">
            {value}{" "}
            <span className="text-primary italic">{entityLabel}</span>
          </h1>
          {meals.length > 0 && (
            <p className="text-muted-foreground mt-2 text-base">
              {meals.length} delicious {value} {itemLabel} to explore
            </p>
          )}
        </div>
      </div>

      {/* Meals Grid */}
      {meals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {meals.map((meal) => (
            <RecipeCard key={meal.idMeal} recipe={meal} variant="grid" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {meals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="text-6xl">🍽️</div>
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              No recipes found
            </h3>
            <p className="text-muted-foreground max-w-sm">
              We couldn&apos;t find any {value} {itemLabel} right now.
            </p>
          </div>
          <Link href={backLink}>
            <Button
              variant="outline"
              className="rounded-full border-border hover:border-primary hover:text-primary gap-2 mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}