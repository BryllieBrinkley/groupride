import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { StatCard } from "@/components/shared/StatCard";
import { AdminPricingClient } from "@/components/admin-pricing-client";
import { requireRole } from "@/lib/auth";
import { listPricingRules } from "@/lib/services/bookings";

export default async function AdminPricingPage() {
  await requireRole(["admin"]);
  const pricingRules = listPricingRules();

  const kpi = {
    active: pricingRules.filter((rule) => rule.status === "active").length,
    sprinter: pricingRules.filter((rule) => rule.category === "sprinter").length,
    minibus: pricingRules.filter((rule) => rule.category === "minibus").length,
    charter: pricingRules.filter((rule) => rule.category === "charter_bus").length,
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
          description="Review active fare rules by market and vehicle class so customer estimates stay aligned with marketplace supply."
          meta={
            <>
              <Badge variant="blue">Automated estimates</Badge>
              <Badge variant="neutral">Manual overrides OK</Badge>
            </>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Active rules" value={kpi.active} />
        <StatCard label="Sprinter rules" value={kpi.sprinter} />
        <StatCard label="Minibus rules" value={kpi.minibus} />
        <StatCard label="Charter rules" value={kpi.charter} />
      </div>

      <AdminPricingClient rules={pricingRules} />
    </DashboardShell>
  );
}
