"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { Button } from "@/components/ui/button"

export default function BookingStatusPage() {
  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="premium-panel p-8 md:p-10">
            <SectionEyebrow>Status</SectionEyebrow>
            <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-medium tracking-[-0.05em] text-foreground sm:text-5xl">
                  Matching
                </h1>
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground animate-pulse" />
                  <p className="text-sm text-muted-foreground">Operator offer incoming</p>
                </div>
              </div>
              <div className="premium-surface px-6 py-5 text-center">
                <p className="premium-eyebrow">Estimated time</p>
                <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-foreground">12 min</p>
              </div>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="premium-eyebrow mb-5">Trip details</p>
                <div className="space-y-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Route</span>
                    <span className="text-sm text-foreground">Charlotte to airport</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Passengers</span>
                    <span className="text-sm text-foreground">12</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Vehicle</span>
                    <span className="text-sm text-foreground">Mini bus</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="text-sm text-foreground">$350</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="premium-eyebrow mb-5">Progress</p>
                <div className="space-y-6">
                  {[
                    { number: "01", title: "request received", done: true },
                    { number: "02", title: "matching providers", active: true },
                    { number: "03", title: "operator accepted" },
                    { number: "04", title: "ride confirmed" },
                  ].map((step) => (
                    <div key={step.number} className="flex items-center gap-5">
                      <span className={`text-xs font-medium tracking-[0.18em] ${
                        step.done || step.active ? 'text-foreground' : 'text-muted-foreground/40'
                      }`}>
                        {step.number}
                      </span>
                      <span className={`text-sm flex-1 ${
                        step.done || step.active ? 'text-foreground' : 'text-muted-foreground/60'
                      }`}>
                        {step.title}
                      </span>
                      {step.done && (
                        <span className="text-xs text-muted-foreground">Done</span>
                      )}
                      {step.active && (
                        <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Button variant="outline" size="lg" className="w-full">
                Cancel request
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
