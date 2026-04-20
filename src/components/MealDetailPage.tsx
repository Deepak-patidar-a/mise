// src/components/MealDetailPage.tsx
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ChefHat,
  Globe,
  Play,
  Sparkles,
  CheckCircle2,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// ─── Types ─────────────────────────────────────────────────
export type MealDBDetail = {
  idMeal: string
  strMeal: string
  strCategory: string
  strArea: string
  strInstructions: string
  strMealThumb: string
  strYoutube?: string
  strTags?: string
  strSource?: string
  [key: string]: string | undefined
}

type Ingredient = {
  item: string
  amount: string
}

// ─── Helper — extract ingredients from MealDB fields ───────
function getMealIngredients(meal: MealDBDetail): Ingredient[] {
  const ingredients: Ingredient[] = []
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]
    const measure    = meal[`strMeasure${i}`]
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        item:   ingredient.trim(),
        amount: measure?.trim() ?? "",
      })
    }
  }
  return ingredients
}

// ─── Helper — split instructions into steps ────────────────
function parseInstructions(raw: string): string[] {
  // MealDB instructions are a big block of text
  // Split on newlines or numbered steps
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 10) // remove empty/short lines
}

// ─── Helper — YouTube video ID ─────────────────────────────
function getYouTubeId(url?: string): string | null {
  if (!url) return null
  const match = url.match(/[?&]v=([^&]+)/)
  return match ? match[1] : null
}

// ─── Main Component ─────────────────────────────────────────
export default function MealDetailPage({ meal }: { meal: MealDBDetail }) {
  const ingredients  = getMealIngredients(meal)
  const instructions = parseInstructions(meal.strInstructions)
  const youtubeId    = getYouTubeId(meal.strYoutube)
  const tags         = meal.strTags
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) ?? []

  return (
    <div className="space-y-8">

      {/* ── Back Link ──────────────────────────────────────── */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Explore
      </Link>

      {/* ── Hero Card ──────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">

        {/* Image */}
        <div className="relative w-full h-64 sm:h-80 lg:h-[420px] overflow-hidden">
          <Image
            src={meal.strMealThumb}
            alt={meal.strMeal}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* TODAY'S SOURCE badge */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ChefHat className="w-3 h-3 text-primary" />
            MealDB Recipe
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-10 space-y-5">

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="text-primary border-primary/30 bg-primary/5 font-medium"
            >
              {meal.strCategory}
            </Badge>
            <Badge
              variant="outline"
              className="text-muted-foreground border-border font-medium gap-1"
            >
              <Globe className="w-3 h-3" />
              {meal.strArea}
            </Badge>
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs gap-1"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            {meal.strMeal}
          </h1>

          {/* AI CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={`/recipe?cook=${encodeURIComponent(meal.strMeal)}`}>
              <Button
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 gap-2 shadow-[0_4px_16px_rgba(232,82,10,0.3)] hover:shadow-[0_8px_24px_rgba(232,82,10,0.4)] hover:-translate-y-0.5 transition-all group"
              >
                <Sparkles className="w-4 h-4" />
                Cook with AI
                <span className="text-white/70 text-xs font-normal">
                  (nutrition, tips & more)
                </span>
              </Button>
            </Link>
            {meal.strYoutube && (
              <a
                href={meal.strYoutube}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="rounded-full border-border hover:border-primary hover:text-primary gap-2 transition-all"
                >
                  <Play className="w-4 h-4" />
                  Watch on YouTube
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Content Grid ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left — Ingredients ─────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-24 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              Ingredients
              <span className="ml-auto text-sm font-normal text-muted-foreground font-sans">
                {ingredients.length} items
              </span>
            </h2>

            <ul className="space-y-0">
              {ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center gap-2 py-2.5 border-b border-border last:border-0"
                >
                  <span className="text-sm text-foreground capitalize">
                    {ing.item}
                  </span>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {ing.amount}
                  </span>
                </li>
              ))}
            </ul>

            {/* AI upsell in ingredients panel */}
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-primary">
                ✨ AI Enhanced Version
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get ingredient substitutions, nutrition info, and chef tips by
                generating the AI version.
              </p>
              <Link href={`/recipe?cook=${encodeURIComponent(meal.strMeal)}`}>
                <Button
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full text-xs mt-1 gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate AI Recipe
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right — Instructions ────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Instructions
            </h2>

            <div className="relative">
              {instructions.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex gap-5 pb-7 ${
                    index !== instructions.length - 1
                      ? "border-l-2 border-primary/20 ml-5"
                      : "ml-5"
                  }`}
                >
                  {/* Step number */}
                  <div className="absolute -left-5 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-[0_4px_12px_rgba(232,82,10,0.3)]">
                    {index + 1}
                  </div>

                  {/* Step text */}
                  <p className="pl-8 text-sm text-muted-foreground leading-relaxed pt-2">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Done message */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">
                  You&apos;re all done!
                </h3>
                <p className="text-sm text-green-700 font-light mt-0.5">
                  Enjoy your {meal.strMeal}!
                </p>
              </div>
            </div>
          </div>

          {/* YouTube embed */}
          {youtubeId && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Watch How to Make It
                </h2>
              </div>
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={`How to make ${meal.strMeal}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Source link */}
          {meal.strSource && (
            <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Original Recipe Source
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  View the original recipe on the source website
                </p>
              </div>
              <a
                href={meal.strSource}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border hover:border-primary hover:text-primary flex-shrink-0"
                >
                  View Source
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}