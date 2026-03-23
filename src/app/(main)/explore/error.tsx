"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ExploreError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-foreground">
        Something went wrong
      </h2>
      <p className="text-muted-foreground max-w-sm">
        {error.message || "Failed to load recipes. Please try again."}
      </p>
      <Button
        onClick={reset}
        className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
      >
        Try Again
      </Button>
    </div>
  )
}