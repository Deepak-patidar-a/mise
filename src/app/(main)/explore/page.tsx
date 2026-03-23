import AreaGrid from "@/components/AreaGrid"
import CategoryGrid from "@/components/CategoryGrid"
import RecipeOfTheDay from "@/components/RecipeOfTheDay"
import { getRecipeofTheDay, getAreas, getCategories } from "@/lib/actions/mealdb.actions"


export default async function ExplorePage() {
  const [recipeData, categoriesData, areasData] = await Promise.all([
    getRecipeofTheDay(),
    getCategories(),
    getAreas(),
  ])

  const recipe     = recipeData.success     ? recipeData.recipe          : null
  const categories = categoriesData.success ? categoriesData.categories  : []
  const areas      = areasData.success      ? areasData.areas            : []

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-black text-foreground tracking-tight">
          Fresh Recipes, Served Daily
        </h1>
        <p className="mt-2 text-muted-foreground text-lg font-light">
          Discover thousands of recipes from around the world. Cook, create and savor.
        </p>
      </div>

      {/* Recipe of the Day */}
      {recipe && <RecipeOfTheDay recipe={recipe} />}

      {/* Browse by Category */}
      {categories.length > 0 && <CategoryGrid categories={categories} />}

      {/* Browse by Cuisine */}
      {areas.length > 0 && <AreaGrid areas={areas} />}
    </div>
  )
}
