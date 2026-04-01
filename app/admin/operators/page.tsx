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
import { Input } from "@/components/ui/input";
import { requireRole } from "@/lib/auth";
import { listOperators } from "@/lib/services/operators";

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
          title="Operator network"
          description="See who covers which markets, what they run, and who is ready for weddings, sports travel, and corporate groups."
          meta={
            <>
              <Badge variant="blue">Verified partners</Badge>
              <Badge variant="neutral">Marketplace dispatch</Badge>
            </>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Active operators" value={kpi.active} />
        <StatCard label="Pending approvals" value={kpi.pending} />
        <StatCard label="Suspended" value={kpi.suspended} />
        <StatCard label="Total fleet size" value={kpi.fleet} />
      </div>

      <FilterBar>
        <Input className="max-w-sm bg-background" placeholder="Search operators..." />
        <select className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none">
          <option>Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Suspended</option>
        </select>
      </FilterBar>

      {isLoading ? (
        <LoadingSkeleton />
      ) : operators.length === 0 ? (
        <EmptyState title="No operators found" description="No operators match your filters." />
      ) : (
        <DataTable
          columns={[
            { key: "companyName", label: "Company" },
            { key: "serviceArea", label: "Service Area", render: (_: any, row: any) => row.serviceAreas?.join(", ") || "-" },
            { key: "fleetSize", label: "Fleet Size", render: (_: any, row: any) => row.vehicles?.length || 0 },
            { key: "status", label: "Status", render: (val: any) => <StatusBadge status={val} /> },
            { key: "completedRides", label: "Completed Rides" },
            { key: "rating", label: "Rating", render: (val: any) => val ? val.toFixed(1) : "-" },
            { key: "actions", label: "Actions", render: () => <span className="text-muted-foreground">View</span> },
          ]}
          data={operators.map((o: any) => ({
            companyName: o.companyName,
            serviceAreas: o.serviceAreas,
            vehicles: o.vehicles,
            status: o.status,
            rating: o.rating,
            completedRides: o.completedTrips || 0,
            actions: "",
          }))}
        />
      )}
    </DashboardShell>
  );
}
