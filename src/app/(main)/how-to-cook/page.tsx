// app/(main)/how-to-cook/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChefHat, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const EXAMPLES = [
  "Butter Chicken", "Chocolate Brownies",
  "Caesar Salad",   "Pasta Carbonara", "Paneer Tikka",
]

export default function HowToCookPage() {
  const router = useRouter()
  const [recipeName, setRecipeName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipeName.trim()) {
      toast.error("Please enter a recipe name")
      return
    }
    router.push(`/recipe?cook=${encodeURIComponent(recipeName.trim())}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-lg space-y-8 text-center">

        {/* Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
            <ChefHat className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl font-black text-foreground tracking-tight">
              How to Cook?
            </h1>
            <p className="text-muted-foreground mt-2 text-lg font-light">
              Enter any recipe and our AI chef guides you through it step by step
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              What would you like to cook?
            </label>
            <div className="relative">
              <Input
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="e.g. Chicken Biryani, Chocolate Cake..."
                className="rounded-xl border-border focus:border-primary h-12 pr-11"
                autoFocus
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Examples */}
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">
                Try these
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setRecipeName(example)}
                  className="px-3 py-1.5 bg-card text-sm text-foreground border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!recipeName.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full h-12 gap-2 shadow-[0_4px_16px_rgba(232,82,10,0.3)] hover:-translate-y-0.5 transition-all disabled:shadow-none disabled:translate-y-0"
          >
            <ChefHat className="w-4 h-4" />
            Get Recipe
          </Button>
        </form>
      </div>
    </div>
  )
}