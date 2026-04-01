import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/shared/PageHeader";


import { DashboardShell } from "@/components/shared/DashboardShell";
import { StatCard } from "@/components/shared/StatCard";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { listOperators } from "@/lib/services/bookings";

export default async function AdminOperatorsPage() {
  await requireRole(["admin"]);
  const operators = await listOperators();
  const isLoading = false; // Replace with actual loading state if needed
  // Example KPIs
  const kpi = {
    active: operators.filter((o: any) => o.status === "active").length,
    pending: operators.filter((o: any) => o.status === "pending").length,
    suspended: operators.filter((o: any) => o.status === "suspended").length,
    fleet: operators.reduce((sum: number, o: any) => sum + (o.vehicles?.length || 0), 0),
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardNav
          currentPath="/admin/operators"
          items={[
            { href: "/admin", label: "Overview" },
            { href: "/admin/bookings", label: "Bookings" },
            { href: "/admin/operators", label: "Operators" },
            { href: "/admin/pricing", label: "Pricing" },
          ]}
        />
      }
      header={
        <PageHeader
          eyebrow="Transportation partners"
          title="operator network."
          description="See who covers which markets, what they run, and who is ready for weddings, sports travel, and corporate groups."
          meta={
            <div className="flex flex-wrap gap-3">
              <Badge variant="blue">Verified partners</Badge>
              <Badge variant="neutral">Marketplace dispatch</Badge>
            </div>
          }
        />
      }
    >
      {/* Stat row */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Active operators" value={kpi.active} />
        <StatCard label="Pending approvals" value={kpi.pending} />
        <StatCard label="Suspended" value={kpi.suspended} />
        <StatCard label="Total fleet size" value={kpi.fleet} />
      </div>

      {/* Filter/search row */}
      <FilterBar>
        <input className="input input-bordered w-full max-w-xs" placeholder="Search operators..." />
        <select className="select select-bordered">
          <option>Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
        </select>
      </FilterBar>

      {/* Table section with loading/empty/data states */}
      {isLoading ? (
        <LoadingSkeleton className="h-32 w-full rounded-xl" />
      ) : operators.length === 0 ? (
        <EmptyState title="No operators found" description="No operators match your filters." />
      ) : (
        <DataTable
          columns={[
            { key: "companyName", label: "Company" },
            { key: "serviceArea", label: "Service Area", render: (_: any, row: any) => (row.serviceAreas?.map((a: any) => a.label).join(", ") || "-") },
            { key: "fleetSize", label: "Fleet Size", render: (_: any, row: any) => row.vehicles?.length || 0 },
            { key: "status", label: "Status", render: (val: any) => <StatusBadge status={val} /> },
            { key: "completedRides", label: "Completed Rides" },
            { key: "rating", label: "Rating", render: (val: any) => val ? val.toFixed(1) : "-" },
            { key: "actions", label: "Actions", render: (_: any, row: any) => <button className="text-blue-600">View</button> },
          ]}
          data={operators.map((o: any) => ({
            ...o,
            serviceArea: o.serviceAreas,
            fleetSize: o.vehicles?.length || 0,
            completedRides: o.completedRides || 0,
            actions: "",
          }))}
        />
      )}
    </DashboardShell>
  );
}
