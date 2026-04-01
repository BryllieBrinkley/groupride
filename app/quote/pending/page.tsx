"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Check, ArrowRight } from "lucide-react"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { Button } from "@/components/ui/button"

export default function PendingReviewPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell py-16 md:py-20">
        <div className="mx-auto max-w-3xl premium-panel p-8 md:p-10">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full border border-border bg-background">
              <Check className="h-6 w-6 text-foreground" strokeWidth={2} />
            </div>
          </div>

          <div className="mt-8 text-center">
            <SectionEyebrow className="justify-center">Request submitted</SectionEyebrow>
            <h1 className="mt-5 text-4xl font-medium tracking-[-0.05em] text-foreground sm:text-5xl">
              We&apos;re matching your trip now.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              A GroupRide specialist is reviewing operator availability and building the cleanest option for your group.
            </p>
            {bookingId ? <p className="mt-3 text-sm text-muted-foreground">Reference: {bookingId}</p> : null}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="premium-surface px-5 py-5 text-center">
              <p className="premium-eyebrow">Response window</p>
              <p className="mt-3 text-2xl font-medium tracking-[-0.03em] text-foreground">30-60 min</p>
            </div>
            <div className="premium-surface px-5 py-5 text-center">
              <p className="premium-eyebrow">Operators</p>
              <p className="mt-3 text-sm text-muted-foreground">Vetted transportation partners only</p>
            </div>
            <div className="premium-surface px-5 py-5 text-center">
              <p className="premium-eyebrow">Billing</p>
              <p className="mt-3 text-sm text-muted-foreground">No charge until confirmed</p>
            </div>
          </div>

          <div className="mt-12">
            <p className="premium-eyebrow mb-6">What happens next</p>
            <div className="space-y-6">
              {[
                { number: "01", title: "request received", done: true },
                { number: "02", title: "matching providers", active: true },
                { number: "03", title: "quote delivered" },
                { number: "04", title: "confirm & book" },
              ].map((step) => (
                <div key={step.number} className="flex items-baseline gap-6">
                  <span className={`text-xs font-mono ${
                    step.done || step.active ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}>
                    {step.number}
                  </span>
                  <span className={`text-base lowercase ${
                    step.done || step.active ? 'text-foreground' : 'text-muted-foreground/60'
                  }`}>
                    {step.title}
                  </span>
                  {step.done && (
                    <Check className="h-4 w-4 text-foreground ml-auto" />
                  )}
                  {step.active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-foreground animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-3xl justify-center">
          <Button asChild size="lg">
            <Link href={bookingId ? `/booking/status?id=${bookingId}` : "/booking/status"}>
              View status
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
      <Footer />
    </main>
  )
}
