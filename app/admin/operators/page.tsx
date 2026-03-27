import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { listOperators } from "@/lib/services/bookings";

export default async function AdminOperatorsPage() {
  await requireRole(["admin"]);
  const operators = listOperators();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Supply directory"
        title="operator network."
        description="Track service area coverage, vehicle fit, and which operators are ready for higher-value group work."
        meta={
          <div className="flex flex-wrap gap-3">
            <Badge variant="blue">Supply: vetted</Badge>
            <Badge variant="neutral">Model: guided dispatch</Badge>
          </div>
        }
      >
        <DashboardNav
          currentPath="/admin/operators"
          items={[
            { href: "/admin", label: "Overview" },
            { href: "/admin/bookings", label: "Bookings" },
            { href: "/admin/operators", label: "Operators" },
            { href: "/admin/pricing", label: "Pricing" }
          ]}
        />
      </PageHeader>

      <div className="space-y-4">
        {operators.map(({ operator, serviceAreas, vehicles }) => (
          <Card key={operator.id} className="bg-[#F6F8FA]">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-medium text-ink">{operator.companyName}</p>
                  <p className="mt-2 text-sm text-copy-muted">
                    Rating {operator.rating.toFixed(1)} • {operator.status}
                  </p>
                </div>
                <Badge variant="neutral">Verified operator</Badge>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-line bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Service areas</p>
                  <div className="mt-4 space-y-3">
                    {serviceAreas.map((area) => (
                      <div key={area.id} className="rounded-xl border border-line bg-[#F6F8FA] p-4 text-sm text-copy">
                        <p className="font-medium text-ink">{area.label}</p>
                        <p className="mt-2">
                          {area.city}, {area.state} • {area.radiusMiles} mile radius
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Vehicles</p>
                  <div className="mt-4 space-y-3">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="rounded-xl border border-line bg-[#F6F8FA] p-4 text-sm text-copy">
                        <p className="font-medium text-ink">{vehicle.name}</p>
                        <p className="mt-2">
                          {vehicle.category.toUpperCase()} • capacity {vehicle.capacity} • qty {vehicle.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
