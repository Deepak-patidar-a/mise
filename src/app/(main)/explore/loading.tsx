export default function ExploreLoading() {
  return (
    <div className="space-y-12">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-10 w-72 bg-muted rounded-lg animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Recipe of the day skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl border border-border overflow-hidden">
        <div className="aspect-[4/3] bg-muted animate-pulse" />
        <div className="p-8 space-y-4 bg-card">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="h-10 w-3/4 bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-12 w-40 bg-muted rounded-full animate-pulse" />
        </div>
      </div>

      {/* Category grid skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-52 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      {/* Area grid skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}