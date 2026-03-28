import Link from "next/link";
import { Clock3, Wallet } from "lucide-react";

import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { SystemStatCard } from "@/components/system-stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { listOperatorBookings, listOperatorOffers } from "@/lib/services/bookings";
import { formatCurrency } from "@/lib/utils";

export default async function OperatorPage() {
  const user = await requireRole(["operator"]);
  const offers = listOperatorOffers(user.operatorId ?? "");
  const bookings = listOperatorBookings(user.operatorId ?? "");
  const pendingOffers = offers.filter((entry) => entry.offer.status === "pending");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Partner dashboard"
        title="incoming trips."
        description="Review open requests, accept work that fits your fleet, and track what’s confirmed—all in one place."
        meta={
          <div className="flex flex-wrap gap-3">
            <Badge variant="blue">Receiving requests</Badge>
            <Badge variant="neutral">Same-day reply target</Badge>
          </div>
        }
      >
        <DashboardNav
          currentPath="/operator"
          items={[
            { href: "/operator", label: "Overview" },
            { href: "/operator/offers", label: "Offers" }
          ]}
        />
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <SystemStatCard label="Open offers" value={`${pendingOffers.length}`} supporting="Trips waiting on your response." />
        <SystemStatCard label="Confirmed trips" value={`${bookings.length}`} supporting="Upcoming rides you’ve accepted." icon={<Clock3 className="h-5 w-5" />} />
        <SystemStatCard
          label="Pipeline value"
          value={formatCurrency(offers.filter((entry) => entry.booking).reduce((sum, entry) => sum + (entry.booking?.activeAmount ?? 0), 0))}
          supporting="Estimated value of open offers."
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-[#F6F8FA]">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">New requests</p>
              <CardTitle className="mt-4">Needs your review</CardTitle>
            </div>
            <Link href="/operator/offers" className="inline-flex rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#F9FAFB]">
              Open queue
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {offers.slice(0, 3).map(({ offer, booking }) =>
              booking ? (
                <div key={offer.id} className="rounded-xl border border-line bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-medium text-ink">
                        {booking.pickupLocation.city} to {booking.dropoffLocation.city}
                      </p>
                      <p className="mt-2 text-sm text-copy-muted">
                        {booking.passengers} passengers • {formatCurrency(booking.activeAmount)}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              ) : null
            )}
            {offers.length === 0 ? <p className="text-sm text-copy-muted">No active offers right now.</p> : null}
          </CardContent>
        </Card>

        <Card className="bg-[#F6F8FA]">
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">On your calendar</p>
            <CardTitle className="mt-4">Confirmed rides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-medium text-ink">{booking.pickupLocation.city} pickup</p>
                    <p className="mt-2 text-sm text-copy-muted">
                      {booking.passengers} passengers • {formatCurrency(booking.activeAmount)}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            ))}
            {bookings.length === 0 ? <p className="text-sm text-copy-muted">No confirmed rides yet.</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
