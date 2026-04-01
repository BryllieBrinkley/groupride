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
import { listPricingRules } from "@/lib/services/bookings";

export default async function AdminPricingPage() {
  await requireRole(["admin"]);
  const pricingRules = listPricingRules();
  const isLoading = false; // Replace with actual loading state if needed
  // Example KPIs
  const kpi = {
    active: pricingRules.filter((r: any) => r.status === "active").length,
    seasonal: pricingRules.filter((r: any) => r.type === "seasonal").length,
    airport: pricingRules.filter((r: any) => r.type === "airport").length,
    custom: pricingRules.filter((r: any) => r.type === "custom").length,
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardNav
          currentPath="/admin/pricing"
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
          eyebrow="Pricing & fees"
          title="Instant estimates"
          description="Baseline fares by vehicle category—sprinters, coaches, and SUVs. Admins can still send a custom quote when a trip needs manual pricing."
          meta={
            <>
              <Badge variant="blue">Automated estimates</Badge>
              <Badge variant="neutral">Manual overrides OK</Badge>
            </>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Active rules" value={kpi.active} />
        <StatCard label="Seasonal adjustments" value={kpi.seasonal} />
        <StatCard label="Airport fees" value={kpi.airport} />
        <StatCard label="Custom surcharges" value={kpi.custom} />
      </div>

      <FilterBar>
        <Input className="max-w-sm bg-background" placeholder="Search pricing rules..." />
        <select className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none">
          <option>Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </FilterBar>

      {isLoading ? (
        <LoadingSkeleton />
      ) : pricingRules.length === 0 ? (
        <EmptyState title="No pricing rules found" description="No pricing rules match your filters." />
      ) : (
        <DataTable
          columns={[
            { key: "name", label: "Rule Name" },
            { key: "region", label: "Region" },
            { key: "category", label: "Vehicle Type" },
            { key: "baseFare", label: "Base Rate", render: (val: any) => `$${val}` },
            { key: "ratePerMile", label: "Per-Mile Rate", render: (val: any) => `$${val}` },
            { key: "status", label: "Status", render: (val: any) => <StatusBadge status={val} /> },
            { key: "actions", label: "Actions", render: () => <span className="text-muted-foreground">Edit</span> },
          ]}
          data={pricingRules.map((r: any) => ({ ...r, actions: "" }))}
        />
      )}
    </DashboardShell>
  );
}
