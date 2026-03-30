import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/page-header";
import { PricingRuleEditor } from "@/components/pricing-rule-editor";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { listPricingRules } from "@/lib/services/bookings";

export default async function AdminPricingPage() {
  await requireRole(["admin"]);
  const pricingRules = listPricingRules();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pricing & fees"
        title="instant estimates."
        description="Baseline fares by vehicle category—sprinters, coaches, and SUVs. Admins can still send a custom quote when a trip needs manual pricing."
        meta={
          <div className="flex flex-wrap gap-3">
            <Badge variant="blue">Automated estimates</Badge>
            <Badge variant="neutral">Manual overrides OK</Badge>
          </div>
        }
      >
        <DashboardNav
          currentPath="/admin/pricing"
          items={[
            { href: "/admin", label: "Overview" },
            { href: "/admin/bookings", label: "Bookings" },
            { href: "/admin/operators", label: "Operators" },
            { href: "/admin/pricing", label: "Pricing" }
          ]}
        />
      </PageHeader>

      <div className="space-y-4">
        {pricingRules.map((rule) => (
          <PricingRuleEditor key={rule.id} rule={rule} />
        ))}
      </div>
    </div>
  );
}
