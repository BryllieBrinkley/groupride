import Link from "next/link";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable } from "@/components/shared/DataTable";
import { FilterBar } from "@/components/shared/FilterBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { getDashboardMetrics, listAdminBookings } from "@/lib/services/bookings";
import { formatCurrency } from "@/lib/utils";


export default async function AdminPage() {
  await requireRole(["admin"]);
  const metrics = getDashboardMetrics();
  const queue = listAdminBookings().slice(0, 6);
  const isLoading = false; // Replace with actual loading state if needed

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
          title="marketplace command center."
          description="Monitor trips, pricing, and partners. Step in when a booking needs a human."
          meta={
            <div className="flex flex-wrap gap-3">
              <Badge variant="blue">Queue open</Badge>
              <Badge variant="neutral">Same-day response target</Badge>
            </div>
          }
        />
      }
    >
      {/* Stat row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatCard label="Trip requests" value={`${metrics.totalRequests}`} />
        <StatCard label="Needs review" value={`${metrics.pendingReview}`} />
        <StatCard label="Open operator offers" value={`${metrics.openOffers}`} />
        <StatCard label="Booked volume" value={formatCurrency(metrics.grossBookedRevenue)} />
      </div>

      {/* Filter/search row */}
      <FilterBar>
        {/* Add filter/search controls here */}
      </FilterBar>

      {/* Table section with loading/empty/data states */}
      {isLoading ? (
        <LoadingSkeleton className="h-32 w-full rounded-xl" />
      ) : queue.length === 0 ? (
        <EmptyState title="No bookings in queue" description="All caught up!" />
      ) : (
        <DataTable
          columns={[
            { key: "route", label: "Route", render: (_: any, row: any) => (
              <span>
                {row.pickupLocation.city}, {row.pickupLocation.state} to {row.dropoffLocation.city}, {row.dropoffLocation.state}
              </span>
            ) },
            { key: "passengers", label: "Passengers" },
            { key: "activeAmount", label: "Amount", render: (val: any) => formatCurrency(val) },
            { key: "status", label: "Status", render: (val: any) => <StatusBadge status={val} /> },
          ]}
          data={queue.map((b) => ({
            ...b,
            route: "",
          }))}
        />
      )}
    </DashboardShell>
  );
}