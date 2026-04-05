import Link from "next/link"
import { Check, Wallet } from "lucide-react"

import { requireRole } from "@/lib/auth"
import { DashboardShell } from "@/components/shared/DashboardShell"
import { DashboardNav } from "@/components/dashboard-nav"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { SectionCard } from "@/components/shared/SectionCard"
import { TripSummaryCard } from "@/components/shared/TripSummaryCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { OperatorAssignedClient } from "@/components/operator-assigned-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getOperatorDashboard } from "@/lib/services/dashboard"
import { formatCurrency } from "@/lib/utils"

export default async function OperatorDashboard() {
  const user = await requireRole(["operator"])
  const operatorId = user.operatorId ?? ""
  const { metrics, opportunities, bookings, payouts } = getOperatorDashboard(operatorId, user.profileId)

  const assignedBookings = bookings.filter((booking) => ["assigned", "in_progress"].includes(booking.status))
  const completedBookings = bookings.filter((booking) => booking.status === "completed")

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
          title="Fleet activity and incoming work"
          description="Review opportunities, manage assigned trips, monitor completed work, and keep payouts visible in one calm workspace."
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
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Open opportunities" value={opportunities.length} />
        <StatCard label="Assigned trips" value={metrics.assignedTrips} />
        <StatCard label="Completed trips" value={metrics.completedTrips} />
        <StatCard label="Pending payouts" value={formatCurrency(metrics.pendingPayouts)} />
      </div>

      <SectionCard
        eyebrow="Opportunities"
        title="New trip opportunities"
        description="Requests that fit your fleet and are ready for review."
      >
        {opportunities.length === 0 ? (
          <EmptyState
            title="No new requests right now"
            description="New GroupRide trip opportunities will appear here as they are routed to your fleet."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {opportunities.map((booking) => (
              <TripSummaryCard
                key={booking.id}
                eyebrow={`Reference ${booking.reference}`}
                title={`${booking.pickupLocation.city} to ${booking.dropoffLocation.city}`}
                route={booking.formattedRouteText ?? `${booking.pickupLocation.city} to ${booking.dropoffLocation.city}`}
                dateTime={booking.pickupDateTimeLocal}
                passengers={booking.passengers}
                vehicle={booking.requestedVehicleCategory ?? "vehicle TBD"}
                amount={booking.quotedAmount ?? booking.finalAmount ?? 0}
                status={booking.status}
                compact
                footer={
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="text-sm text-muted-foreground">Review pricing, routing, and fleet fit before accepting.</span>
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                      Opportunity
                    </span>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Assigned"
        title="Assigned and in-progress trips"
        description="Work currently on your board and moving toward execution."
      >
        <OperatorAssignedClient
          trips={assignedBookings.map((booking) => ({
            id: booking.id,
            reference: booking.reference,
            title: `${booking.pickupLocation.city} to ${booking.dropoffLocation.city}`,
            route: booking.formattedRouteText ?? `${booking.pickupLocation.city} to ${booking.dropoffLocation.city}`,
            dateTime: booking.pickupDateTimeLocal,
            passengers: booking.passengers,
            vehicle: booking.requestedVehicleCategory ?? "vehicle TBD",
            amount: booking.finalAmount ?? booking.quotedAmount ?? 0,
            status: booking.status,
          }))}
        />
      </SectionCard>

      <SectionCard
        eyebrow="Completed"
        title="Completed trips"
        description="Finished work for your fleet, kept in one place for quick review."
      >
        {completedBookings.length === 0 ? (
          <EmptyState
            title="No completed trips yet"
            description="Completed rides will appear here once your fleet starts closing out bookings."
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {completedBookings.map((booking) => (
              <TripSummaryCard
                key={booking.id}
                eyebrow={`Reference ${booking.reference}`}
                title={`${booking.pickupLocation.city} to ${booking.dropoffLocation.city}`}
                route={booking.formattedRouteText ?? `${booking.pickupLocation.city} to ${booking.dropoffLocation.city}`}
                dateTime={booking.pickupDateTimeLocal}
                passengers={booking.passengers}
                vehicle={booking.requestedVehicleCategory ?? "vehicle TBD"}
                amount={booking.finalAmount ?? booking.quotedAmount ?? 0}
                status={booking.status}
                compact
                footer={
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                    <span className="text-sm text-muted-foreground">Trip completed and ready for payout tracking.</span>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                }
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Payouts"
        title="Payout tracking"
        description="Current and historical payouts tied to completed work."
      >
        {payouts.length === 0 ? (
          <EmptyState
            title="No payouts yet"
            description="Payouts will appear here after completed bookings create payout records."
            icon={<Wallet className="size-6" />}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {payouts.map((payout) => (
              <div key={payout.id} className="premium-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="premium-eyebrow">Booking {payout.bookingId}</p>
                    <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-foreground">
                      {formatCurrency(payout.payoutAmount)}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Gross {formatCurrency(payout.grossAmount)} • Platform fee {formatCurrency(payout.platformFeeAmount)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {payout.paidAt ? `Paid ${payout.paidAt}` : `Created ${payout.createdAt}`}
                    </p>
                  </div>
                  <StatusBadge status={payout.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  )
}
