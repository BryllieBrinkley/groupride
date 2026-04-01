import Link from "next/link";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionEyebrow } from "@/components/shared/SectionEyebrow";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function AccountPage() {
  const bookings = [
    {
      id: "1",
      pickupLocation: { city: "Charlotte", state: "NC" },
      dropoffLocation: { city: "Atlanta", state: "GA" },
      pickupDateTime: "Mar 31, 2026 • 8:30 PM",
      amount: "$1,250",
      status: "confirmed",
    },
    {
      id: "2",
      pickupLocation: { city: "Nashville", state: "TN" },
      dropoffLocation: { city: "Louisville", state: "KY" },
      pickupDateTime: "Apr 4, 2026 • 11:00 AM",
      amount: "$780",
      status: "pending",
    },
  ];

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell py-16 md:py-20">
        <div className="mb-10 max-w-3xl">
          <SectionEyebrow>Your account</SectionEyebrow>
          <h1 className="mt-5 text-5xl font-medium leading-[0.95] tracking-[-0.05em] text-foreground sm:text-6xl">
            Your group trips, all in one calm place.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Every request and confirmed ride in one premium dashboard for status, payment, and pickup details.
          </p>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="premium-panel p-6 text-sm text-muted-foreground">
              No trips yet. Start a booking from the home page.
            </div>
          ) : null}

          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/booking/status?id=${booking.id}`}
              className="block"
            >
              <div className="premium-panel p-6 transition hover:-translate-y-0.5 hover:border-primary/20">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      {booking.pickupLocation.city}, {booking.pickupLocation.state} to {booking.dropoffLocation.city},{" "}
                      {booking.dropoffLocation.state}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {booking.pickupDateTime} • {booking.amount}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
