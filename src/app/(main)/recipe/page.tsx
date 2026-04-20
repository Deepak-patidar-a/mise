"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Flame,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {useFetch }from "@/hooks/use-fetch";
import { Ingredient, Instruction, Nutrition, RecipeActionResult, Substitution } from "@/types/recipe";
import { getOrGenerateRecipe, removeRecipeFromCollection, saveRecipeToCollection } from "@/lib/actions/recipe.actions";

// ─── Types ─────────────────────────────────────────────────

type Recipe = {
  id: string;
  title: string;
  description?: string;
  cuisine?: string;
  category?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tips?: string[];
  substitutions?: Substitution[];
  nutrition?: Nutrition;
};

// ─── Sub-components ────────────────────────────────────────

function LoadingState({ recipeName }: { recipeName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
      {/* Animated flame */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <ChefHat className="w-10 h-10 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-black text-foreground tracking-tight">
          Preparing Your Recipe
        </h2>
        <p className="text-muted-foreground font-light max-w-sm">
          Our AI chef is crafting detailed instructions for{" "}
          <span className="font-semibold text-primary">{recipeName}</span>...
        </p>
      </div>
      {/* Progress bar */}
      <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[loading_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Failed to load recipe
        </h2>
        <p className="text-muted-foreground max-w-sm">{message}</p>
      </div>
      <div className="flex gap-3">
        <Link href="/explore">
          <Button
            variant="outline"
            className="rounded-full border-border hover:border-primary hover:text-primary gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Button>
        </Link>
        <Button
          onClick={onRetry}
          className="bg-primary hover:bg-primary/90 text-white rounded-full gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          No recipe specified
        </h2>
        <p className="text-muted-foreground">
          Please select a recipe from the explore page.
        </p>
      </div>
      <Link href="/explore">
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-full gap-2">
          <ArrowLeft className="w-4 h-4" />
          Go to Explore
        </Button>
      </Link>
    </div>
  );
}

// ─── Nutrition Card ────────────────────────────────────────
function NutritionItem({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div className="bg-secondary border border-border rounded-xl p-3 text-center">
      <div className="text-xl font-black text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">
        {label}
      </div>
    </div>
  );
}

// ─── Main Recipe Content ───────────────────────────────────
function RecipeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const recipeName = searchParams.get("cook");

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // ── Data fetching hooks ──────────────────────────────────
  const {
    loading: loadingRecipe,
    data: recipeData,
    fn: fetchRecipe,
  } = useFetch(getOrGenerateRecipe);

  const {
    loading: saving,
    data: saveData,
    fn: saveToCollection,
  } = useFetch(saveRecipeToCollection);

  const {
    loading: removing,
    data: removeData,
    fn: removeFromCollection,
  } = useFetch(removeRecipeFromCollection);

  // ── Fetch on mount ───────────────────────────────────────
  useEffect(() => {
    if (recipeName && !recipe) {
      const formData = new FormData();
      formData.append("recipeName", recipeName);
      fetchRecipe(formData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeName]);

  // ── Handle recipe data ───────────────────────────────────
  useEffect(() => {
    if (!recipeData?.success || !recipeData.recipe) return;
    const transformedRecipe : any = {
      ...recipeData.recipe,
      instructions: recipeData.recipe.steps || [],
    };
    setRecipe(transformedRecipe);
    setRecipeId(recipeData.recipeId);
    setIsSaved(recipeData.isSaved);
    setIsPro(recipeData.isPro);
    toast.success(
      recipeData.fromDatabase
        ? "Recipe loaded!"
        : "New recipe generated!"
    );
  }, [recipeData]);

  // ── Handle save ──────────────────────────────────────────
  useEffect(() => {
    if (!saveData?.success) return;
    if (saveData.alreadySaved) {
      toast.info("Already in your collection");
    } else {
      setIsSaved(true);
      toast.success("Saved to your collection!");
    }
  }, [saveData]);

  // ── Handle remove ────────────────────────────────────────
  useEffect(() => {
    if (!removeData?.success) return;
    setIsSaved(false);
    toast.success("Removed from collection");
  }, [removeData]);

  // ── Toggle save ──────────────────────────────────────────
  const handleToggleSave = () => {
    if (!recipeId) return;
    const formData = new FormData();
    formData.append("recipeId", recipeId);
    if (isSaved) {
      removeFromCollection(formData);
    } else {
      saveToCollection(formData);
    }
  };

  const handleRetry = () => {
    if (!recipeName) return;
    const formData = new FormData();
    formData.append("recipeName", recipeName);
    fetchRecipe(formData);
  };

  // ── Render states ────────────────────────────────────────
  if (!recipeName) return <EmptyState />;
  if (loadingRecipe === null || loadingRecipe) return <LoadingState recipeName={recipeName} />;
  if (!recipe) return <ErrorState message="Something went wrong loading the recipe." onRetry={handleRetry} />;

  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  // ── Group ingredients by category ───────────────────────
  const groupedIngredients = recipe.ingredients.reduce<Record<string, Ingredient[]>>(
    (acc, ing) => {
      const cat = ing.category ?? "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ing);
      return acc;
    },
    {}
  );
  console.log("recipe", recipe);
  // ── Main render ──────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Back link */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Explore
      </Link>

      {/* ── Hero Card ──────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Recipe image */}
        {recipe.imageUrl && (
          <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-8 lg:p-10 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {recipe.cuisine && (
              <Badge
                variant="outline"
                className="text-primary border-primary/30 bg-primary/5 capitalize"
              >
                {recipe.cuisine}
              </Badge>
            )}
            {recipe.category && (
              <Badge
                variant="outline"
                className="text-muted-foreground border-border capitalize"
              >
                {recipe.category}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
            {recipe.title}
          </h1>

          {/* Description */}
          {recipe.description && (
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              {recipe.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            {totalTime > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{totalTime} mins total</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{recipe.servings} servings</span>
              </div>
            )}
            {recipe.nutrition?.calories && (
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{recipe.nutrition.calories} cal/serving</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleToggleSave}
              disabled={saving || removing}
              className={`rounded-full gap-2 font-semibold transition-all ${
                isSaved
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-primary hover:bg-primary/90 text-white shadow-[0_4px_16px_rgba(232,82,10,0.3)]"
              }`}
            >
              {saving || removing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {saving ? "Saving..." : "Removing..."}
                </>
              ) : isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  Save Recipe
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Content Grid ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left — Ingredients + Nutrition ─────────────── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Ingredients */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-24 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              Ingredients
            </h2>

            {Object.entries(groupedIngredients).map(([category, items]) => (
              <div key={category} className="space-y-1">
                {/* Category label — only show if more than one group */}
                {Object.keys(groupedIngredients).length > 1 && (
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    {category}
                  </h3>
                )}
                <ul className="space-y-0">
                  {items.map((ingredient, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center gap-2 py-2.5 border-b border-border last:border-0"
                    >
                      <span className="text-sm text-foreground">
                        {ingredient.item}
                      </span>
                      <span className="text-sm font-semibold text-primary whitespace-nowrap">
                        {ingredient.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Nutrition */}
            {recipe.nutrition && (
              <div className="pt-4 border-t border-border space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Nutrition / serving
                  {!isPro && (
                    <Badge className="ml-2 text-[10px] bg-primary/10 text-primary border-0">
                      PRO
                    </Badge>
                  )}
                </h3>
                {isPro ? (
                  <div className="grid grid-cols-2 gap-2">
                    <NutritionItem label="Calories" value={recipe.nutrition.calories} />
                    <NutritionItem label="Protein"  value={recipe.nutrition.protein}  />
                    <NutritionItem label="Carbs"    value={recipe.nutrition.carbs}    />
                    <NutritionItem label="Fat"      value={recipe.nutrition.fat}      />
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Upgrade to Pro to unlock nutrition info
                    </p>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white rounded-full text-xs"
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right — Instructions + Tips + Substitutions ─── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Instructions */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Step-by-Step Instructions
            </h2>

            <div className="relative">
              {recipe?.instructions?.map((step, index) => (
                <div
                  key={step.step}
                  className={`relative flex gap-5 pb-8 ${
                    index !== recipe.instructions.length - 1
                      ? "border-l-2 border-primary/20 ml-5"
                      : "ml-5"
                  }`}
                >
                  {/* Step number */}
                  <div className="absolute -left-5 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-[0_4px_12px_rgba(232,82,10,0.3)]">
                    {step.step}
                  </div>

                  {/* Step content */}
                  <div className="pl-8 space-y-2 flex-1">
                    <h3 className="font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {step.instruction}
                    </p>
                    {step.tip && (
                      <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-3 mt-2">
                        <p className="text-sm text-foreground flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                          <span>
                            <strong className="font-semibold">Tip: </strong>
                            {step.tip}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
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
                  Enjoy your {recipe.title}!
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          {recipe.tips && recipe.tips.length > 0 && (
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Chef&apos;s Tips
              </h2>


                <ul className="space-y-3">
                  {recipe.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
            </div>
          )}

          {/* Substitutions */}
          {recipe.substitutions && recipe.substitutions.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                Ingredient Substitutions
                {!isPro && (
                  <Badge className="text-[10px] bg-primary/10 text-primary border-0">
                    PRO
                  </Badge>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                Don&apos;t have everything? Here are some alternatives.
              </p>

              {isPro ? (
                <div className="space-y-4">
                  {recipe.substitutions.map((sub, i) => (
                    <div
                      key={i}
                      className="pb-4 border-b border-border last:border-0 last:pb-0 space-y-2"
                    >
                      <h3 className="text-sm font-semibold text-foreground">
                        Instead of{" "}
                        <span className="text-primary">{sub.original}</span>:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {sub.alternatives.map((alt, j) => (
                          <Badge
                            key={j}
                            variant="outline"
                            className="text-muted-foreground border-border text-xs"
                          >
                            {alt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Upgrade to Pro to unlock substitutions
                  </p>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white rounded-full text-xs"
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page Wrapper with Suspense ────────────────────────────
export default function RecipePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      }
    >
      <RecipeContent />
    </Suspense>
  );
}