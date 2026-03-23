import Link from "next/link"
import Image from "next/image"


interface Category {
  idCategory: string
  strCategory: string
  strCategoryThumb: string
  strCategoryDescription: string
}

interface Props {
  categories: Category[]
}

export default function CategoryGrid({ categories }: Props) {
  return (
    <section>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif text-3xl font-black text-foreground tracking-tight">
          Browse by Category
        </h2>
        <p className="text-muted-foreground mt-1">
          Find recipes that match your mood
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {categories.map((category) => (
          <Link
            key={category.idCategory}
            href={`/explore/category/${category.strCategory}`}
            className="group flex flex-col items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {/* Category Image */}
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image
                src={category.strCategoryThumb}
                alt={category.strCategory}
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-200"
              />
            </div>
            {/* Name */}
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors text-center leading-tight">
              {category.strCategory}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}