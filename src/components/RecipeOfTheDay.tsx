import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Props {
  recipe: {
    idMeal: string
    strMeal: string
    strCategory: string
    strArea: string
    strMealThumb: string
    strInstructions: string
    strTags?: string
  }
}

export default function RecipeOfTheDay({ recipe }: Props) {
  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Recipe of the Day
        </h2>
      </div>

      {/* Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">

        {/* Image */}
        <div className="relative aspect-[4/3] md:aspect-auto min-h-[280px]">
          <Image
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            fill
            className="object-cover"
            priority
          />
          {/* Today's Special badge */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-primary" />
            TODAY&apos;S SPECIAL
          </div>
        </div>

        {/* Content */}
        <div className="bg-card p-6 sm:p-8 flex flex-col justify-center gap-4">
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-primary border-primary/30 bg-primary/5 font-medium"
            >
              {recipe.strCategory}
            </Badge>
            <Badge
              variant="outline"
              className="text-muted-foreground font-medium"
            >
              🌍 {recipe.strArea}
            </Badge>
            {recipe.strTags?.split(",").slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs"
              >
                {tag.trim()}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-serif text-3xl sm:text-4xl font-black text-foreground leading-tight">
            {recipe.strMeal}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {recipe.strInstructions}
          </p>

          {/* CTA */}
          <Link href={`/explore/${recipe.idMeal}`} className="mt-2">
            <Button
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-8 shadow-[0_4px_16px_rgba(232,82,10,0.3)] hover:shadow-[0_8px_24px_rgba(232,82,10,0.4)] hover:-translate-y-0.5 transition-all duration-200 group"
            >
              Start Cooking
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}