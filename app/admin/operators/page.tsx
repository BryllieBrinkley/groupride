import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { StatCard } from "@/components/shared/StatCard";
import { AdminOperatorsClient } from "@/components/admin-operators-client";
import { requireRole } from "@/lib/auth";
import { listOperators } from "@/lib/services/operators";

export default async function AdminOperatorsPage() {
  await requireRole(["admin"]);
  const operators = await listOperators();

  const operatorRows = operators.map((operator) => ({
    id: operator.id,
    companyName: operator.companyName,
    serviceArea: operator.serviceAreas.join(", ") || "Coverage pending",
    fleetSize: operator.vehicles.reduce((sum, vehicle) => sum + (vehicle.quantity || 1), 0),
    status: operator.status,
    completedRides: operator.completedTrips || 0,
    rating: operator.rating ?? null,
    contactEmail: operator.profile?.email ?? "No contact email",
    capacitySummary:
      operator.vehicles.length > 0
        ? operator.vehicles.map((vehicle) => `${vehicle.name} (${vehicle.capacity} seats x ${vehicle.quantity})`).join(" • ")
        : "No active vehicles listed",
    payoutReady: operator.payoutAccountConnected,
  }));

  const kpi = {
    active: operators.filter((operator) => operator.status === "active").length,
    pending: operators.filter((operator) => operator.status === "pending").length,
    suspended: operators.filter((operator) => operator.status === "suspended").length,
    fleet: operators.reduce(
      (sum, operator) => sum + operator.vehicles.reduce((vehicleSum, vehicle) => vehicleSum + (vehicle.quantity || 1), 0),
      0,
    ),
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
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active operators" value={kpi.active} />
        <StatCard label="Pending approvals" value={kpi.pending} />
        <StatCard label="Suspended" value={kpi.suspended} />
        <StatCard label="Fleet units" value={kpi.fleet} />
      </div>

      <AdminOperatorsClient operators={operatorRows} />
    </DashboardShell>
  );
}
