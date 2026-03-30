import Link from "next/link";

import { AdminBookingActions } from "@/components/admin-booking-actions";
import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { listAdminBookings } from "@/lib/services/bookings";
import { formatLocalDateTime } from "@/lib/time";
import { formatCurrency } from "@/lib/utils";

export default async function AdminBookingsPage() {
  await requireRole(["admin"]);
  const bookings = listAdminBookings();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Booking queue"
        title="trip queue."
        description="Send requests to transportation partners, adjust pricing with customer approval, and close trips that can’t be fulfilled."
        meta={
          <div className="flex flex-wrap gap-3">
            <Badge variant="neutral">Control: pricing + supply</Badge>
            <Badge variant="blue">Workflow: coordinated</Badge>
          </div>
        }
      >
        <DashboardNav
          currentPath="/admin/bookings"
          items={[
            { href: "/admin", label: "Overview" },
            { href: "/admin/bookings", label: "Bookings" },
            { href: "/admin/operators", label: "Operators" },
            { href: "/admin/pricing", label: "Pricing" }
          ]}
        />
      </PageHeader>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="bg-[#F6F8FA]">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xl font-medium text-ink">
                      {booking.pickupLocation.city}, {booking.pickupLocation.state} to {booking.dropoffLocation.city}, {booking.dropoffLocation.state}
                    </p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-3 text-sm text-copy">
                    {formatLocalDateTime(booking.pickupDateTimeUtc, booking.pickupTimezone)} • {booking.passengers} passengers •{" "}
                    {formatCurrency(booking.activeAmount)}
                  </p>
                  {booking.reviewTriggers.length > 0 ? (
                    <p className="mt-2 text-sm text-copy-muted">
                      Concierge triggers: {booking.reviewTriggers.join(", ").replaceAll("_", " ")}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href={`/booking/${booking.id}`} className="text-sm font-semibold text-[#3B82F6]">
                      Open customer view
                    </Link>
                    {booking.approvalToken ? <Badge variant="warning">Approval token active</Badge> : null}
                    {booking.paymentRecoveryToken ? <Badge variant="warning">Payment recovery active</Badge> : null}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Operator controls</p>
                <div className="mt-4">
                  <AdminBookingActions bookingId={booking.id} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
