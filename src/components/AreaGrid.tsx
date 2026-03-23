import { getCountryFlag } from "@/lib/utils"
import Link from "next/link"


interface Area {
  strArea: string
}

interface Props {
  areas: Area[]
}

export default function AreaGrid({ areas }: Props) {
  return (
    <section>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-3xl font-black text-foreground tracking-tight">
          Explore World Cuisines
        </h2>
        <p className="text-muted-foreground mt-1">
          Travel the globe through food
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {areas.map((area) => (
          <Link
            key={area.strArea}
            href={`/explore/cuisine/${area.strArea}`}
            className="group flex items-center gap-3 p-3 sm:p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {/* Flag emoji */}
            <span className="text-2xl flex-shrink-0">
              {getCountryFlag(area.strArea)}
            </span>
            {/* Name */}
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
              {area.strArea}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}