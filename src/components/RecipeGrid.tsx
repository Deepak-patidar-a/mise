"use client";

import { useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import RecipeCard from "./RecipeCard";
import { useFetch } from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────
export type Meal = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
};

type Props = {
  type: "category" | "cuisine";
  value: string;
  fetchAction: (value: string) => Promise<{ success: boolean; meals: Meal[] }>;
  backLink?: string;
};

// ─── Skeleton Card ────────────────────────────────────────
function RecipeCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function RecipeGrid({
  type,
  value,
  fetchAction,
  backLink = "/explore",
}: Props) {
  const {
    loading,
    data,
    fn: fetchMeals,
  } = useFetch<Meal[], [string]>(async (val: string) => {
    const res = await fetchAction(val);
    return res.meals;
  });

  useEffect(() => {
    if (!value) return;
    // Capitalize first letter and decode URI (saudi-arabian → Saudi Arabian)
    const formatted = value
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    fetchMeals(formatted);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const meals = data ?? [];

  // Decode URL slug for display: "saudi-arabian" → "Saudi Arabian"
  const displayName = value
    ?.split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const entityLabel = type === "cuisine" ? "Cuisine" : "Recipes";
  const itemLabel   = type === "cuisine" ? "dishes"  : "recipes";

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Back link */}
        <Link
          href={backLink}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Explore
        </Link>

        {/* Title */}
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-foreground capitalize tracking-tight leading-tight">
            {displayName}{" "}
            <span className="text-primary italic">{entityLabel}</span>
          </h1>

          {/* Subtitle — only show when loaded */}
          {!loading && meals.length > 0 && (
            <p className="text-muted-foreground mt-2 text-base">
              {meals.length} delicious {displayName} {itemLabel} to explore
            </p>
          )}
        </div>
      </div>

      {/* ── Loading State — Skeleton Grid ───────────────── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Meals Grid ──────────────────────────────────── */}
      {!loading && meals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {meals.map((meal: Meal) => (
            <RecipeCard key={meal.idMeal} recipe={meal} variant="grid" />
          ))}
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────── */}
      {!loading && meals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="text-6xl">🍽️</div>
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              No recipes found
            </h3>
            <p className="text-muted-foreground max-w-sm">
              We couldn&apos;t find any {displayName} {itemLabel} right now.
              Try exploring a different {type}.
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
  );
}