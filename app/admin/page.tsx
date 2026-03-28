import Link from "next/link";

import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { SystemStatCard } from "@/components/system-stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getDashboardMetrics, listAdminBookings } from "@/lib/services/bookings";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPage() {
  await requireRole(["admin"]);
  const metrics = getDashboardMetrics();
  const queue = listAdminBookings().slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Platform admin"
        title="marketplace command center."
        description="Monitor trips, pricing, and partners. Step in when a booking needs a human—disputes, coverage gaps, or custom quotes."
        meta={
          <div className="flex flex-wrap gap-3">
            <Badge variant="blue">Queue open</Badge>
            <Badge variant="neutral">Same-day response target</Badge>
          </div>
        }
      >
        <DashboardNav
          currentPath="/admin"
          items={[
            { href: "/admin", label: "Overview" },
            { href: "/admin/bookings", label: "Bookings" },
            { href: "/admin/operators", label: "Operators" },
            { href: "/admin/pricing", label: "Pricing" }
          ]}
        />
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <SystemStatCard label="Trip requests" value={`${metrics.totalRequests}`} />
        <SystemStatCard label="Needs review" value={`${metrics.pendingReview}`} />
        <SystemStatCard label="Open operator offers" value={`${metrics.openOffers}`} />
        <SystemStatCard label="Booked volume" value={formatCurrency(metrics.grossBookedRevenue)} />
      </div>

      <Card className="bg-[#F6F8FA]">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Priority queue</p>
            <CardTitle className="mt-4">Trips that may need a human</CardTitle>
            <p className="mt-3 text-sm leading-6 text-copy-muted">
              Custom quotes, coverage gaps, large groups, and edge cases show up here first.
            </p>
          </div>
          <Link href="/admin/bookings" className="inline-flex rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#F9FAFB]">
            Open full queue
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {queue.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {booking.pickupLocation.city}, {booking.pickupLocation.state} to {booking.dropoffLocation.city}, {booking.dropoffLocation.state}
                  </p>
                  <p className="mt-2 text-sm text-copy-muted">
                    {booking.passengers} passengers • {formatCurrency(booking.activeAmount)}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
