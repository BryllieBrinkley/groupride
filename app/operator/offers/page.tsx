import { DashboardNav } from "@/components/dashboard-nav";
import { OperatorOfferActions } from "@/components/operator-offer-actions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { listOperatorOffers } from "@/lib/services/bookings";
import { formatCurrency } from "@/lib/utils";

export default async function OperatorOffersPage() {
  const user = await requireRole(["operator"]);
  const offers = listOperatorOffers(user.operatorId ?? "");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Open offers"
        title="review & respond."
        description="Each card shows route, group size, trip value, and status—accept when it fits your fleet and schedule."
        meta={
          <div className="flex flex-wrap gap-3">
            <Badge variant="neutral">Verified partner</Badge>
            <Badge variant="blue">Active queue</Badge>
          </div>
        }
      >
        <DashboardNav
          currentPath="/operator/offers"
          items={[
            { href: "/operator", label: "Overview" },
            { href: "/operator/offers", label: "Offers" }
          ]}
        />
      </PageHeader>

      <div className="space-y-4">
        {offers.map(({ offer, booking }) =>
          booking ? (
            <Card key={offer.id} className="bg-[#F6F8FA]">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xl font-medium text-ink">
                        {booking.pickupLocation.city}, {booking.pickupLocation.state} to {booking.dropoffLocation.city},{" "}
                        {booking.dropoffLocation.state}
                      </p>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="mt-3 text-sm text-copy">
                      {booking.passengers} passengers • {booking.vehicleCategory.toUpperCase()} • {formatCurrency(booking.activeAmount)}
                    </p>
                    <p className="mt-2 text-sm text-copy-muted">Offer expires {offer.expiresAt.slice(0, 16).replace("T", " ")}</p>
                  </div>

                  <div className="w-full max-w-sm rounded-xl border border-line bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Operator action</p>
                    <p className="mt-2 text-sm leading-6 text-copy">Accept to secure the request. Declining returns it to the marketplace queue.</p>
                    <div className="mt-4">
                      <OperatorOfferActions offerId={offer.id} disabled={offer.status !== "pending" || booking.status !== "operator_offer_open"} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null
        )}
      </div>
    </div>
  );
}
