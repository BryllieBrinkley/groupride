import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionEyebrow } from "@/components/shared/SectionEyebrow";
import { Button } from "@/components/ui/button";
import { getBookingById } from "@/lib/services/bookings";
import { formatCurrency } from "@/lib/utils";

export default async function BookingStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const result = params.id ? getBookingById(params.id) : null;
  const booking = result?.booking;

  const timeline = [
    { number: "01", title: "request received", active: booking?.status === "pending" },
    { number: "02", title: "quote prepared", active: booking?.status === "quoted" },
    { number: "03", title: "awaiting payment", active: booking?.status === "awaiting_payment" },
    {
      number: "04",
      title: "confirmed and assigned",
      active: ["confirmed", "assigned", "in_progress", "completed"].includes(booking?.status ?? ""),
    },
  ];

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
                  {booking?.status ? booking.status.replace(/_/g, " ") : "Matching"}
                </h1>
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    {booking ? `Reference ${booking.reference}` : "Operator offer incoming"}
                  </p>
                </div>
              </div>
              <div className="premium-surface px-6 py-5 text-center">
                <p className="premium-eyebrow">Estimated time</p>
                <p className="mt-3 text-3xl font-medium tracking-[-0.03em] text-foreground">
                  {booking?.pickupDateTimeLocal ? "On schedule" : "12 min"}
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="premium-eyebrow mb-5">Trip details</p>
                <div className="space-y-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Route</span>
                    <span className="text-sm text-foreground">
                      {booking?.formattedRouteText ?? (booking ? `${booking.pickupLocation.city} to ${booking.dropoffLocation.city}` : "Charlotte to airport")}
                    </span>
                  </div>
                  {booking?.distanceMiles || booking?.driveTimeMinutes ? (
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-muted-foreground">Drive estimate</span>
                      <span className="text-sm text-foreground">
                        {booking.distanceMiles?.toFixed(1) ?? "--"} miles • {booking.driveTimeMinutes ?? "--"} min
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Passengers</span>
                    <span className="text-sm text-foreground">{booking?.passengers ?? 12}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Vehicle</span>
                    <span className="text-sm text-foreground">{booking?.requestedVehicleCategory ?? "Mini bus"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="text-sm text-foreground">
                      {booking ? formatCurrency(booking.finalAmount ?? booking.quotedAmount ?? 0) : "$350"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="premium-eyebrow mb-5">Progress</p>
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
                      <span className={`text-sm flex-1 ${step.active ? "text-foreground" : "text-muted-foreground/60"}`}>
                        {step.title}
                      </span>
                      {step.active ? <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" /> : null}
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
  );
}
