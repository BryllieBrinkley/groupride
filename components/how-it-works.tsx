export function HowItWorks() {
  const steps = [
    { number: "01", title: "share your route, date, and group size" },
    { number: "02", title: "we match the best ride" },
    { number: "03", title: "book and pay securely through GroupRide" },
  ]

  return (
    <section id="how-it-works" className="px-6 py-24 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-sm lowercase text-muted-foreground">
            how it works
          </p>
          <h2 className="text-4xl tracking-tight text-foreground lowercase md:text-5xl">
            simple group transportation, handled for you
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border border-border bg-background p-8"
            >
              <p className="mb-8 text-sm text-muted-foreground">
                {step.number}
              </p>
              <h3 className="text-xl lowercase text-foreground">
                {step.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}