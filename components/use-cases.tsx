import { Plane, Heart, Users } from "lucide-react"

const useCases = [
  {
    icon: Plane,
    title: "Airport groups",
    description: "Coordinating airport pickups and drop-offs for conferences, family reunions, or corporate events. We handle timing and logistics.",
  },
  {
    icon: Heart,
    title: "Weddings and events",
    description: "Keep your guests moving seamlessly between venues. From rehearsal dinners to the big day, we've got you covered.",
  },
  {
    icon: Users,
    title: "Teams and sports",
    description: "Travel as a team, arrive as a team. Perfect for tournaments, away games, or team-building retreats.",
  },
]

export function UseCases() {
  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
            Perfect for any occasion
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From airports to weddings, we make group transportation effortless
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {useCases.map((useCase) => (
              <div 
                key={useCase.title}
                className="group relative rounded-2xl bg-card border border-border p-8 transition-all hover:shadow-lg hover:border-primary/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <useCase.icon className="h-6 w-6" />
                </div>
                
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  {useCase.title}
                </h3>
                
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
