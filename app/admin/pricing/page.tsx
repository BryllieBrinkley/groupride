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
        eyebrow="Pricing controls"
        title="quote defaults."
        description="These deterministic rules create fast first-pass pricing. Ops can still override pricing later when a trip needs manual coordination."
        meta={
          <div className="flex flex-wrap gap-3">
            <Badge variant="blue">Pricing: deterministic</Badge>
            <Badge variant="neutral">Overrides: enabled</Badge>
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
