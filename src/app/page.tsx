import Link from "next/link"
import { ArrowRight, Sparkles, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { AVATAR_COLORS, AVATAR_INITIALS, STATS, STEPS } from "@/constants"


const FlameMark = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1C12 1 4 9 4 16C4 21.523 7.582 26 12 26C16.418 26 20 21.523 20 16C20 9 12 1 12 1Z" fill="#E8520A" opacity="0.2"/>
    <path d="M12 7C12 7 7 14 7 18.5C7 22.09 9.239 25 12 25C14.761 25 17 22.09 17 18.5C17 14 12 7 12 7Z" fill="#E8520A" opacity="0.5"/>
    <path d="M12 13C12 13 9.5 17 9.5 20C9.5 22.485 10.619 24 12 24C13.381 24 14.5 22.485 14.5 20C14.5 17 12 13 12 13Z" fill="#E8520A"/>
  </svg>
)



export default function HomePage() {
  return (
    <div className="w-full">

      <section className="relative w-full overflow-hidden">

        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(232,82,10,0.10)_0%,transparent_70%)]" />

          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(circle, #E8520A20 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-16 md:py-20 lg:py-24">

            {/* ── Left Content ────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">

              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                #1 AI Cooking Assistant
              </div>

              {/* Headline */}
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-foreground mb-6">
                Turn your{" "}
                <span className="relative inline-block text-primary italic">
                  leftovers
                  {/* Underline squiggle */}
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 220 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6 C55 2, 165 2, 218 6"
                      stroke="#E8520A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
                {" "}into{" "}
                <span className="text-foreground">masterpieces.</span>
              </h1>

              {/* Subtext */}
              <p className="text-lg sm:text-xl text-muted-foreground font-light leading-relaxed max-w-lg mb-10">
                Snap a photo of your fridge. Mise tells you what to cook.
                Save money, reduce waste, and eat better - every night.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto">
                <SignedOut>
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-8 py-6 text-base shadow-[0_8px_24px_rgba(232,82,10,0.35)] hover:shadow-[0_12px_32px_rgba(232,82,10,0.45)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                    >
                      Start Cooking Free
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/sign-in" className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full sm:w-auto text-muted-foreground hover:text-foreground hover:bg-secondary font-medium rounded-full px-8 cursor-pointer"
                    >
                      Sign In
                    </Button>
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link href="/recipes" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-8 py-6 text-base shadow-[0_8px_24px_rgba(232,82,10,0.35)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
                    >
                      Go to My Recipes
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3">
                {/* Avatar stack */}
                <div className="flex items-center">
                  {AVATAR_INITIALS.map((initial, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i]} text-white text-xs font-bold flex items-center justify-center border-2 border-background ${i !== 0 ? "-ml-2" : ""}`}
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">10,000+</span> cooks joined last month
                </p>
              </div>
            </div>

            {/* ── Right — Recipe Card Visual ───────────────── */}
            <div className="flex-shrink-0 w-full max-w-sm lg:max-w-md relative">

              {/* Main card */}
              <div className="relative bg-gradient-to-br from-primary/20 via-orange-200/60 to-primary/80 rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">


                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-white/95 shadow-xl flex items-center justify-center">
                    <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-border flex items-center justify-center text-7xl sm:text-8xl">
                      🍝
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <FlameMark className="w-3 h-3" />
                  TODAY&apos;S SPECIAL
                </div>

                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  <span className="bg-white/90 backdrop-blur-sm text-orange-700 text-xs font-semibold px-3 py-1 rounded-full border border-orange-200">
                    🍮 Dessert
                  </span>
                  <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                    🌍 Italian
                  </span>
                </div>

                {/* AI badge */}
                <div className="absolute bottom-4 right-4 bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary" />
                  AI Generated
                </div>
              </div>

 
              <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-white rounded-2xl shadow-xl p-4 min-w-[190px] border border-border">
                <div className="flex text-primary text-sm mb-1">
                  {"★★★★★"}
                </div>
                <p className="font-semibold text-sm text-foreground mb-2">Tomato Basil Pasta</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 25 mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> 2 servings
                  </span>
                </div>
              </div>

              {/* Floating pantry scan card */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-white rounded-2xl shadow-lg p-3 border border-border flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                  📸
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Pantry Scanned</p>
                  <p className="text-xs text-muted-foreground">12 ingredients found</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.value} className="flex flex-col items-center text-center">
                <span className="font-serif text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="text-center mb-14">
          <p className="text-primary text-sm font-bold tracking-widest uppercase mb-3">
            How it works
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Three steps to your next meal
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="relative bg-card border border-border rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              {/* Step number */}
              <span className="absolute top-5 right-5 font-serif text-4xl font-black text-border">
                {item.step}
              </span>
              <div className="text-4xl mb-4">{item.emoji}</div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-24">
        <div className="relative bg-foreground rounded-3xl overflow-hidden px-8 sm:px-12 py-14 sm:py-16 text-center">
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-[radial-gradient(ellipse,rgba(232,82,10,0.35)_0%,transparent_70%)] pointer-events-none" />

          <FlameMark className="w-10 h-12 mx-auto mb-6" />
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Ready to cook smarter?
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-md mx-auto font-light">
            Join 10,000+ home cooks already using Mise to reduce waste and eat better.
          </p>
          <SignedOut>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-10 py-6 text-base shadow-[0_8px_32px_rgba(232,82,10,0.5)] hover:shadow-[0_12px_40px_rgba(232,82,10,0.6)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/pantry">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-10 py-6 text-base shadow-[0_8px_32px_rgba(232,82,10,0.5)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                Scan My Pantry
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </SignedIn>
        </div>
      </section>

    </div>
  )
}