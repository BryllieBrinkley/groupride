import Link from "next/link"

import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { SectionCard } from "@/components/shared/SectionCard"
import { TripSummaryCard } from "@/components/shared/TripSummaryCard"
import { Button } from "@/components/ui/button"
import { getBookingById } from "@/lib/services/bookings"
import { formatCurrency } from "@/lib/utils"

export default async function BookingStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const params = await searchParams
  const result = params.id ? getBookingById(params.id) : null
  const booking = result?.booking

  const timeline = [
    { number: "01", title: "request received", active: booking?.status === "pending" },
    { number: "02", title: "quote prepared", active: booking?.status === "quoted" },
    { number: "03", title: "awaiting payment", active: booking?.status === "awaiting_payment" },
    {
      number: "04",
      title: "confirmed and assigned",
      active: ["confirmed", "assigned", "in_progress", "completed"].includes(booking?.status ?? ""),
    },
  ]

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="premium-panel p-8 md:p-10">
            <SectionEyebrow>Status</SectionEyebrow>

            {!booking ? (
              <div className="mt-6 space-y-6">
                <h1 className="text-4xl font-medium tracking-[-0.05em] text-foreground sm:text-5xl">
                  Booking status unavailable
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  We couldn&apos;t find a booking for this link yet. If you just submitted your request, return to the pending page or start a new quote.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link href="/">Start a new quote</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/quote/pending">Back to pending page</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-4xl font-medium tracking-[-0.05em] text-foreground sm:text-5xl">
                      {booking.status.replace(/_/g, " ")}
                    </h1>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-foreground animate-pulse" />
                      <p className="text-sm text-muted-foreground">Reference {booking.reference}</p>
                    </div>
                  </div>
                  <div className="premium-surface px-6 py-5 text-center">
                    <p className="premium-eyebrow">Pickup timing</p>
                    <p className="mt-3 text-xl font-medium tracking-[-0.03em] text-foreground">
                      {booking.pickupDateTimeLocal || "To be confirmed"}
                    </p>
                  </div>
                </div>

                <div className="mt-10 grid gap-8 md:grid-cols-[0.95fr_1.05fr]">
                  <TripSummaryCard
                    eyebrow="Trip details"
                    title="Current booking details"
                    route={booking.formattedRouteText ?? `${booking.pickupLocation.city} to ${booking.dropoffLocation.city}`}
                    dateTime={booking.pickupDateTimeLocal}
                    passengers={booking.passengers}
                    vehicle={booking.requestedVehicleCategory ?? "vehicle pending"}
                    amount={booking.finalAmount ?? booking.quotedAmount ?? 0}
                    status={booking.status}
                    details={[
                      { label: "Reference", value: booking.reference },
                      { label: "Drive estimate", value: booking.distanceMiles || booking.driveTimeMinutes ? `${booking.distanceMiles?.toFixed(1) ?? "--"} miles • ${booking.driveTimeMinutes ?? "--"} min` : "Pending route estimate" },
                    ]}
                    compact
                  />

                  <SectionCard
                    eyebrow="Progress"
                    title="Where the trip stands"
                    description="We’ll keep this status page updated as the booking moves forward."
                  >
                    <div className="space-y-6">
                      {timeline.map((step) => (
                        <div key={step.number} className="flex items-center gap-5">
                          <span
                            className={`text-xs font-medium tracking-[0.18em] ${
                              step.active ? "text-foreground" : "text-muted-foreground/40"
                            }`}
                          >
                            {step.number}
                          </span>
                          <span className={`flex-1 text-sm ${step.active ? "text-foreground" : "text-muted-foreground/60"}`}>
                            {step.title}
                          </span>
                          {step.active ? <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" /> : null}
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Button asChild variant="outline" size="lg">
                    <Link href="/account">View account dashboard</Link>
                  </Button>
                  <Button asChild size="lg">
                    <Link href="/">Book another trip</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
