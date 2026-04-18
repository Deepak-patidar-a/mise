import Link from "next/link";
import Image from "next/image";
import { Clock, Users, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────

// MealDB recipe (explore/category/cuisine pages)
type MealDBRecipe = {
  strMeal: string;
  strMealThumb: string;
  idMeal: string;
};

// AI pantry-generated recipe
type PantryRecipe = {
  title: string;
  description?: string;
  category?: string;
  cuisine?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  matchPercentage: number;
  missingIngredients?: string[];
  imageUrl?: string;
};

// User's own DB recipe
type DBRecipe = {
  title: string;
  description?: string;
  category?: string;
  cuisine?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
};

type Recipe = MealDBRecipe | PantryRecipe | DBRecipe;

type Variant = "grid" | "pantry" | "list" | "default";

type Props = {
  recipe: Recipe;
  variant?: Variant;
};

// ─── Normalized shape returned by getRecipeData ───────────
type NormalizedRecipe = {
  title: string;
  description?: string;
  category?: string;
  cuisine?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  matchPercentage?: number;
  missingIngredients?: string[];
  image?: string;
  href: string;
  showImage: boolean;
};

// ─── Type Guards ──────────────────────────────────────────
function isMealDBRecipe(r: Recipe): r is MealDBRecipe {
  return "strMeal" in r;
}

function isPantryRecipe(r: Recipe): r is PantryRecipe {
  return "matchPercentage" in r;
}

// ─── Fallback Placeholder ─────────────────────────────────
function ImageFallback() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-muted flex items-center justify-center">
      <ChefHat className="w-12 h-12 text-primary/30" />
    </div>
  );
}

// ─── Match % Badge Color ──────────────────────────────────
function getMatchColor(pct: number): string {
  if (pct >= 90) return "bg-green-600 text-white";
  if (pct >= 75) return "bg-primary text-white";
  return "bg-muted-foreground text-white";
}

// ─── Main Component ───────────────────────────────────────
export default function RecipeCard({ recipe, variant = "default" }: Props) {

  const getRecipeData = (): NormalizedRecipe => {
    if (isMealDBRecipe(recipe)) {
      return {
        title:     recipe.strMeal,
        image:     recipe.strMealThumb,
        href:      `/recipe?cook=${encodeURIComponent(recipe.strMeal)}`,
        showImage: true,
      };
    }

    if (isPantryRecipe(recipe)) {
      return {
        title:               recipe.title,
        description:         recipe.description,
        category:            recipe.category,
        cuisine:             recipe.cuisine,
        prepTime:            recipe.prepTime,
        cookTime:            recipe.cookTime,
        servings:            recipe.servings,
        matchPercentage:     recipe.matchPercentage,
        missingIngredients:  recipe.missingIngredients ?? [],
        image:               recipe.imageUrl,
        href:                `/recipe?cook=${encodeURIComponent(recipe.title)}`,
        showImage:           !!recipe.imageUrl,
      };
    }

    // DB recipe
    return {
      title:     recipe.title,
      description: recipe.description,
      category:  recipe.category,
      cuisine:   recipe.cuisine,
      prepTime:  recipe.prepTime,
      cookTime:  recipe.cookTime,
      servings:  recipe.servings,
      image:     recipe.imageUrl,
      href:      `/recipe?cook=${encodeURIComponent(recipe.title)}`,
      showImage: !!recipe.imageUrl,
    };
  };

  const data = getRecipeData();
  const totalTime =
    (data.prepTime ?? 0) + (data.cookTime ?? 0);

  // ── Variant: grid ────────────────────────────────────────
  if (variant === "grid") {
    return (
      <Link href={data.href}>
        <Card className="rounded-2xl overflow-hidden border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group pt-0">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden">
            {data.showImage && data.image ? (
              <Image
                src={data.image}
                alt={data.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <ImageFallback />
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm font-medium">
                  View Recipe →
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <CardHeader className="p-4">
            <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {data.title}
            </CardTitle>
          </CardHeader>
        </Card>
      </Link>
    );
  }

  // ── Variant: pantry ──────────────────────────────────────
  if (variant === "pantry") {
    return (
      <Card className="rounded-2xl border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          {data.showImage && data.image ? (
            <Image
              src={data.image}
              alt={data.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <ImageFallback />
          )}
          {/* Match badge on image */}
          {data.matchPercentage !== undefined && (
            <div className="absolute top-3 right-3">
              <Badge
                className={`${getMatchColor(data.matchPercentage)} text-sm px-3 py-1 shadow-md font-semibold`}
              >
                {data.matchPercentage}% Match
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          {/* Cuisine + Category badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {data.cuisine && (
              <Badge
                variant="outline"
                className="text-primary border-primary/30 bg-primary/5 capitalize text-xs"
              >
                {data.cuisine}
              </Badge>
            )}
            {data.category && (
              <Badge
                variant="outline"
                className="text-muted-foreground border-border capitalize text-xs"
              >
                {data.category}
              </Badge>
            )}
          </div>

          <CardTitle className="font-serif text-xl font-bold text-foreground leading-snug">
            {data.title}
          </CardTitle>

          {data.description && (
            <CardDescription className="text-muted-foreground leading-relaxed line-clamp-2 mt-1">
              {data.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          {/* Time + servings */}
          {(totalTime > 0 || data.servings) && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              {totalTime > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{totalTime} mins</span>
                </div>
              )}
              {data.servings && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{data.servings} servings</span>
                </div>
              )}
            </div>
          )}

          {/* Missing ingredients */}
          {data.missingIngredients && data.missingIngredients.length > 0 && (
            <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl">
              <h4 className="text-xs font-semibold text-primary mb-2">
                You&apos;ll need:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {data.missingIngredients.map((ingredient: string, i: number) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-primary border-primary/30 bg-card text-xs"
                  >
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <Link href={data.href} className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full shadow-sm gap-2 cursor-pointer">
              <ChefHat className="w-4 h-4" />
              View Full Recipe
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // ── Variant: list ────────────────────────────────────────
  if (variant === "list") {
    return (
      <Link href={data.href}>
        <Card className="rounded-2xl border-border hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group overflow-hidden py-0">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative w-full sm:w-48 aspect-video sm:aspect-square flex-shrink-0 overflow-hidden">
              {data.showImage && data.image ? (
                <Image
                  src={data.image}
                  alt={data.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 192px"
                />
              ) : (
                <ImageFallback />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col justify-center">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {data.cuisine && (
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/30 bg-primary/5 capitalize text-xs"
                  >
                    {data.cuisine}
                  </Badge>
                )}
                {data.category && (
                  <Badge
                    variant="outline"
                    className="text-muted-foreground border-border capitalize text-xs"
                  >
                    {data.category}
                  </Badge>
                )}
              </div>

              <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-1">
                {data.title}
              </h3>

              {data.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {data.description}
                </p>
              )}

              {/* Time + servings */}
              {(totalTime > 0 || data.servings) && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {totalTime > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{totalTime} mins</span>
                    </div>
                  )}
                  {data.servings && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{data.servings} servings</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // ── Variant: default (fallback) ──────────────────────────
  return (
    <Link href={data.href}>
      <Card className="rounded-2xl border-border hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden pt-0">
        {data.showImage && data.image && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={data.image}
              alt={data.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        )}
        <CardHeader className="p-4">
          <CardTitle className="font-serif text-lg font-bold text-foreground">
            {data.title}
          </CardTitle>
          {data.description && (
            <CardDescription className="line-clamp-2 text-muted-foreground">
              {data.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}