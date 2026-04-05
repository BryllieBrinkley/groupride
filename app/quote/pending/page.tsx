import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { SectionCard } from "@/components/shared/SectionCard"
import { TripSummaryCard } from "@/components/shared/TripSummaryCard"
import { Button } from "@/components/ui/button"

export default async function PendingReviewPage({
  searchParams,
}: {
  searchParams: Promise<{
    bookingId?: string
  }>
}) {
  const params = await searchParams
  const bookingId = params.bookingId

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell py-16 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionCard
            eyebrow="Request submitted"
            title="We&apos;re matching your trip now."
            description="A GroupRide specialist is reviewing operator availability and building the cleanest option for your group."
          >
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full border border-border bg-background">
              <Check className="h-6 w-6 text-foreground" strokeWidth={2} />
            </div>
          </div>

          <div className="mt-8 text-center">
            {bookingId ? (
              <p className="mt-3 text-sm text-muted-foreground">Booking reference: {bookingId}</p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Your request is in review. Open your status page any time for the latest update.</p>
            )}
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
              {/* Demo timeline states: wired for UX continuity while backend lifecycle automation is still stubbed. */}
              {[
                { number: "01", title: "request received", done: true },
                { number: "02", title: "matching providers", active: true },
                { number: "03", title: "quote delivered" },
                { number: "04", title: "confirm & book" },
              ].map((step) => (
                <div key={step.number} className="flex items-baseline gap-6">
                  <span className={`text-xs font-mono ${step.done || step.active ? "text-foreground" : "text-muted-foreground/40"}`}>
                    {step.number}
                  </span>
                  <span className={`text-base lowercase ${step.done || step.active ? "text-foreground" : "text-muted-foreground/60"}`}>
                    {step.title}
                  </span>
                  {step.done ? <Check className="ml-auto h-4 w-4 text-foreground" /> : null}
                  {step.active ? <span className="ml-auto h-2 w-2 rounded-full bg-foreground animate-pulse" /> : null}
                </div>
              ))}
            </div>
          </div>
          </SectionCard>

          <TripSummaryCard
            eyebrow="Status summary"
            title="Booking in review"
            route="Your request is now in the live dispatch queue."
            status="pending"
            details={[
              { label: "Reference", value: bookingId ?? "Pending" },
              { label: "Next step", value: "Operator matching in progress" },
            ]}
          />
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href={bookingId ? `/booking/status?id=${bookingId}` : "/booking/status"}>
              View status
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Book another trip</Link>
          </Button>
        </div>
      </section>
      <Footer />
    </main>
  )
}
