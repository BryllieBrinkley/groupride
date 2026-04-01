import Link from "next/link"
import { Check } from "lucide-react"

import { requireRole } from "@/lib/auth"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { DashboardNav } from "@/components/dashboard-nav"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getOperatorDashboard } from "@/lib/services/dashboard"
import { formatCurrency } from "@/lib/utils"

export default async function OperatorDashboard() {
  const user = await requireRole(["operator"])
  const operatorId = user.operatorId ?? ""
  const { metrics, opportunities, bookings } = getOperatorDashboard(operatorId, user.profileId)
  const activeBookings = bookings.filter((booking) => ["assigned", "in_progress", "completed"].includes(booking.status))

  return (
    <DashboardShell
      sidebar={
        <DashboardNav
          currentPath="/operator"
          items={[
            { href: "/operator", label: "Overview" },
            { href: "/operator", label: "Bookings" },
            { href: "/operator", label: "Pricing" },
          ]}
        />
      }
      header={
        <PageHeader
          eyebrow="Operator portal"
          title="Incoming trip opportunities"
          description="Review live requests, accept the right fits, and keep your calendar filled with premium group work."
          meta={
            <>
              <Badge variant="neutral">Warm dispatch workflow</Badge>
              <Badge variant="blue">Real-time demand</Badge>
            </>
          }
          actions={
            <Button asChild variant="outline">
              <Link href="/">Back to site</Link>
            </Button>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending quotes" value={metrics.pendingQuotes} />
        <StatCard label="Assigned trips" value={metrics.assignedTrips} />
        <StatCard label="Pending payouts" value={formatCurrency(metrics.pendingPayouts)} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium tracking-[-0.04em] text-foreground">Open opportunities</h2>
          <p className="text-sm text-muted-foreground">{opportunities.length} active opportunities</p>
        </div>

        {opportunities.length === 0 ? (
          <EmptyState title="No new requests right now" description="New GroupRide trip opportunities will appear here as they are routed to your fleet." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {opportunities.map((booking) => (
              <div key={booking.id} className="premium-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium text-foreground">
                      {booking.pickupLocation.city} to {booking.dropoffLocation.city}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {booking.passengers} passengers • {booking.requestedVehicleCategory ?? "vehicle TBD"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{booking.pickupDateTimeLocal}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-medium tracking-[-0.04em] text-foreground">
                      {formatCurrency(booking.quotedAmount ?? booking.finalAmount ?? 0)}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {activeBookings.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-medium tracking-[-0.04em] text-foreground">Assigned and completed trips</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {activeBookings.map((booking) => (
              <div key={booking.id} className="premium-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-medium text-foreground">
                        {booking.pickupLocation.city} to {booking.dropoffLocation.city}
                      </h3>
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {booking.passengers} passengers • {booking.requestedVehicleCategory ?? "vehicle TBD"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{booking.pickupDateTimeLocal}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-medium tracking-[-0.04em] text-foreground">
                      {formatCurrency(booking.finalAmount ?? booking.quotedAmount ?? 0)}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </DashboardShell>
  )
}
