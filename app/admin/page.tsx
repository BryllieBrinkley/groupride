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
    <main className="min-h-screen bg-[#f3efe9] px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader
          eyebrow="platform admin"
          title="marketplace command center."
          description="Monitor trips, pricing, and partners. Step in when a booking needs a human."
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
              { href: "/admin", label: "overview" },
              { href: "/admin/bookings", label: "bookings" },
              { href: "/admin/operators", label: "operators" },
              { href: "/admin/pricing", label: "pricing" },
            ]}
          />
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SystemStatCard
            label="Trip requests"
            value={`${metrics.totalRequests}`}
          />
          <SystemStatCard
            label="Needs review"
            value={`${metrics.pendingReview}`}
          />
          <SystemStatCard
            label="Open operator offers"
            value={`${metrics.openOffers}`}
          />
          <SystemStatCard
            label="Booked volume"
            value={formatCurrency(metrics.grossBookedRevenue)}
          />
        </div>

        <Card className="rounded-[28px] border border-[#d8d2ca] bg-[#e9e4dd] shadow-[0_25px_60px_rgba(0,0,0,0.06)]">
          <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-black/35">
                priority queue
              </p>

              <CardTitle className="mt-4 text-3xl font-normal tracking-[-0.04em] text-black lowercase">
                trips that may need a human.
              </CardTitle>

              <p className="mt-4 text-sm leading-6 text-black/55 lowercase">
                custom quotes, coverage gaps, large groups, and edge cases show
                up here first.
              </p>
            </div>

            <Link
              href="/admin/bookings"
              className="inline-flex items-center justify-center rounded-md border border-black/10 bg-[#f7f4ef] px-4 py-3 text-sm font-medium lowercase text-black transition hover:border-black/20 hover:bg-white"
            >
              open full queue
            </Link>
          </CardHeader>

          <CardContent className="space-y-4">
            {queue.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-black/10 bg-[#f7f4ef] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-lg font-medium lowercase text-black">
                      {booking.pickupLocation.city},{" "}
                      {booking.pickupLocation.state} to{" "}
                      {booking.dropoffLocation.city},{" "}
                      {booking.dropoffLocation.state}
                    </p>

                    <p className="mt-2 text-sm text-black/55 lowercase">
                      {booking.passengers} passengers •{" "}
                      {formatCurrency(booking.activeAmount)}
                    </p>
                  </div>

                  <StatusBadge status={booking.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}