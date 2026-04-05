import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { TripSummaryCard } from "@/components/shared/TripSummaryCard";
import { requireRole } from "@/lib/auth";
import { getStore } from "@/lib/data/demo-store";
import { getAdminDashboard } from "@/lib/services/dashboard";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPage() {
  await requireRole(["admin"]);
  const { metrics, bookings, operators, notifications } = getAdminDashboard();
  const store = getStore();
  const urgentQueue = bookings.filter((booking) => ["pending", "quoted", "awaiting_payment"].includes(booking.status)).slice(0, 4);
  const recentNotifications = notifications.slice(0, 4);

  return (
    <DashboardShell
      sidebar={
        <DashboardNav
          currentPath="/admin"
          items={[
            { href: "/admin", label: "overview" },
            { href: "/admin/bookings", label: "bookings" },
            { href: "/admin/operators", label: "operators" },
            { href: "/admin/pricing", label: "pricing" },
          ]}
        />
      }
      header={
        <PageHeader
          eyebrow="platform admin"
          title="Marketplace command center"
          description="Monitor bookings, supply, and pricing from one dispatch-oriented overview."
          meta={
            <>
              <Badge variant="blue">Queue open</Badge>
              <Badge variant="neutral">Same-day response target</Badge>
            </>
          }
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/admin/bookings">Open booking queue</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/operators">View operators</Link>
              </Button>
            </>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Trip requests" value={`${metrics.totalBookings}`} />
        <StatCard label="Needs review" value={`${metrics.pendingBookings}`} />
        <StatCard label="Open quotes" value={`${metrics.openQuotes}`} />
        <StatCard label="Booked volume" value={formatCurrency(metrics.confirmedRevenue)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Urgent queue"
          title="Bookings that still need an admin decision"
          description="Open the queue for pricing actions, quote requests, or confirmation when supply is ready."
        >
          <div className="space-y-4">
            {urgentQueue.length === 0 ? (
              <div className="rounded-3xl border border-border bg-background px-5 py-5 text-sm text-muted-foreground">
                No urgent bookings right now. The live queue is clear.
              </div>
            ) : (
              urgentQueue.map((booking) => (
                <TripSummaryCard
                  key={booking.id}
                  eyebrow={`Reference ${booking.reference}`}
                  title={
                    store.profiles.find((profile) => profile.id === booking.customerProfileId)?.fullName ?? "Customer"
                  }
                  route={
                    booking.formattedRouteText ??
                    `${booking.pickupLocation.city}, ${booking.pickupLocation.state} to ${booking.dropoffLocation.city}, ${booking.dropoffLocation.state}`
                  }
                  dateTime={booking.pickupDateTimeLocal}
                  passengers={booking.passengers}
                  vehicle={booking.requestedVehicleCategory ?? "vehicle pending"}
                  amount={booking.finalAmount ?? booking.quotedAmount ?? 0}
                  status={booking.status}
                  compact
                />
              ))
            )}
            <div>
              <Button asChild variant="outline">
                <Link href="/admin/bookings">Go to full booking workflow</Link>
              </Button>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            eyebrow="Supply snapshot"
            title="Operator network readiness"
            description="Keep an eye on active supply and whether payout onboarding is complete."
          >
            <div className="grid gap-3">
              <div className="premium-surface px-4 py-4">
                <p className="premium-eyebrow">Active operators</p>
                <p className="mt-3 text-2xl font-medium tracking-[-0.03em] text-foreground">
                  {operators.filter((operator) => operator.status === "active").length}
                </p>
              </div>
              <div className="premium-surface px-4 py-4">
                <p className="premium-eyebrow">Payout-ready partners</p>
                <p className="mt-3 text-2xl font-medium tracking-[-0.03em] text-foreground">
                  {operators.filter((operator) => operator.payoutAccountConnected).length}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/admin/operators">Open operator network</Link>
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Recent activity"
            title="Latest notifications"
            description="A quick view of the most recent customer and marketplace events."
          >
            <div className="space-y-3">
              {recentNotifications.length === 0 ? (
                <div className="rounded-3xl border border-border bg-background px-5 py-5 text-sm text-muted-foreground">
                  No recent notifications.
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <div key={notification.id} className="premium-surface px-4 py-4">
                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.message}</p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardShell>
  );
}
