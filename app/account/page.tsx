import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { listCustomerBookings } from "@/lib/services/bookings";
import { formatLocalDateTime } from "@/lib/time";
import { formatCurrency } from "@/lib/utils";

export default async function AccountPage() {
  const user = await requireRole(["customer"]);
  const bookings = listCustomerBookings(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your account"
        title="your group trips."
        description="Every request and confirmed ride in one place—open a trip anytime for status, payment, and pickup details."
        meta={
          <div className="flex flex-wrap gap-3">
            <Badge variant="neutral">Trip history</Badge>
            <Badge variant="blue">Status updates on</Badge>
          </div>
        }
      />

      <div className="space-y-4">
        {bookings.length === 0 ? <Card className="bg-[#F6F8FA]"><CardContent className="py-6 text-sm text-copy-muted">No trips yet. Start a booking from the home page or Book a trip.</CardContent></Card> : null}
        {bookings.map((booking) => (
          <Link key={booking.id} href={`/booking/${booking.id}`} className="block">
            <Card className="bg-[#F6F8FA] transition hover:border-accent">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">
                      {booking.pickupLocation.city}, {booking.pickupLocation.state} to {booking.dropoffLocation.city}, {booking.dropoffLocation.state}
                    </p>
                    <p className="mt-2 text-sm text-copy-muted">
                      {formatLocalDateTime(booking.pickupDateTimeUtc, booking.pickupTimezone)} • {formatCurrency(booking.activeAmount)}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
