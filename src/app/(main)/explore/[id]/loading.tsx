// app/(main)/explore/[id]/loading.tsx
export default function MealDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-4 w-32 bg-muted rounded-full" />
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="h-64 sm:h-80 lg:h-[420px] bg-muted" />
        <div className="p-8 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-muted rounded-full" />
            <div className="h-6 w-24 bg-muted rounded-full" />
          </div>
          <div className="h-12 w-2/3 bg-muted rounded-lg" />
          <div className="h-10 w-40 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  )
}