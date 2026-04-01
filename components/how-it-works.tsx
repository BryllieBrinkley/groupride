export function HowItWorks() {
  const steps = [
    { number: "01", title: "share your route, date, and group size"},
    { number: "02", title: "we match the best ride"},
    { number: "03", title: "book and pay securely through GroupRide"},
  ]

return (
    <section id="how-it-works" className="py-24 px-6 lg:px-12 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xs text-muted-foreground mb-16 lowercase">
          how it works
        </h2>
        
        <div className="space-y-12">
          {steps.map((step) => (
            <div key={step.number} className="flex items-baseline gap-8">
              <span className="text-xs text-muted-foreground/50 font-mono">
                {step.number}
              </span>
              <h3 className="text-2xl sm:text-3xl text-foreground lowercase">
                {step.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
