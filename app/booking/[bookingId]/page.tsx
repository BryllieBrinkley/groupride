import { notFound } from "next/navigation";

import { BookingCustomerActions } from "@/components/booking-customer-actions";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSessionUser } from "@/lib/auth";
import { getBookingById } from "@/lib/services/bookings";
import { formatLocalDateTime } from "@/lib/time";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default async function BookingPage({
  params,
  searchParams
}: {
  params: Promise<{ bookingId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { bookingId } = await params;
  const detail = getBookingById(bookingId);
  if (!detail) {
    notFound();
  }

  const user = await getSessionUser();
  const resolvedSearch = searchParams ? await searchParams : {};
  const token = typeof resolvedSearch.token === "string" ? resolvedSearch.token : undefined;
  const canCancel = Boolean(user && (user.role === "admin" || user.id === detail.booking.customerUserId));
  const approvalToken = token && detail.booking.approvalToken === token ? token : undefined;
  const recoveryToken = token && detail.booking.paymentRecoveryToken === token ? token : undefined;

  const statusHeadline =
    detail.booking.status === "confirmed"
      ? "trip confirmed."
      : detail.booking.status === "payment_action_required"
        ? "complete payment to confirm."
        : "request received.";

  const statusCopy =
    detail.booking.status === "confirmed"
      ? "Your transportation is booked. We’ll keep you and your driver updated as the travel date approaches."
      : detail.booking.status === "payment_action_required"
        ? "Almost there—finish payment below so we can lock in your vehicle and driver."
        : "Transportation partners are reviewing your trip. Most requests hear back within a few hours; confirmation is often same day.";

  const stages = [
    { label: "Request sent", active: true },
    {
      label: "Partner matching",
      active: ["operator_offer_open", "operator_accepted", "payment_processing", "payment_action_required", "confirmed"].includes(detail.booking.status)
    },
    {
      label: "Booked",
      active: ["confirmed"].includes(detail.booking.status)
    }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Booking status"
        title={statusHeadline}
        description={statusCopy}
        meta={
          <div className="flex flex-wrap gap-3">
            <Badge variant="neutral">Request ID: {detail.booking.id}</Badge>
            <Badge variant="blue">Live status</Badge>
          </div>
        }
      >
        <StatusBadge status={detail.booking.status} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[#F6F8FA]">
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Trip progress</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {stages.map((stage) => (
                <div
                  key={stage.label}
                  className={`rounded-xl border px-4 py-4 ${stage.active ? "border-accent bg-white" : "border-line bg-[#F6F8FA]"}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Stage</p>
                  <p className="mt-2 text-base font-medium text-ink">{stage.label}</p>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-line bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Trip summary</p>
              <p className="mt-3 text-xl font-medium text-ink">
                {detail.booking.pickupLocation.city}, {detail.booking.pickupLocation.state} to {detail.booking.dropoffLocation.city},{" "}
                {detail.booking.dropoffLocation.state}
              </p>
              <p className="mt-2 text-sm text-copy-muted">Pay only after confirmation. Verified transportation partners.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Summary label="Trip total" value={formatCurrency(detail.booking.activeAmount)} />
              <Summary label="Vehicle" value={detail.booking.vehicleCategory.toUpperCase()} />
              <Summary label="Passengers" value={`${detail.booking.passengers}`} />
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Pickup" value={detail.booking.pickupLocation.label} />
              <DetailRow label="Dropoff" value={detail.booking.dropoffLocation.label} />
              <DetailRow
                label="Pickup time"
                value={formatLocalDateTime(detail.booking.pickupDateTimeUtc, detail.booking.pickupTimezone)}
              />
              <DetailRow label="Distance" value={`${formatNumber(detail.booking.distanceMiles)} miles`} />
            </div>

            {detail.booking.reviewTriggers.length > 0 ? (
              <div className="rounded-xl border border-line bg-white p-4 text-sm text-copy">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Manual review</p>
                <p className="mt-2">
                  Our team is coordinating this trip because of:{" "}
                  {detail.booking.reviewTriggers.join(", ").replaceAll("_", " ")}.
                </p>
              </div>
            ) : null}

            <div className="rounded-xl border border-line bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Next steps</p>
              <p className="mt-2 text-sm leading-6 text-copy">
                We email you at every major step. If a revised price or payment is needed, use the secure actions below.
              </p>
              <div className="mt-4">
                <BookingCustomerActions
                  bookingId={detail.booking.id}
                  canCancel={canCancel}
                  approvalToken={approvalToken}
                  recoveryToken={recoveryToken}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-[#F6F8FA]">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Activity</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {detail.paymentAttempts.map((attempt) => (
                <TimelineItem
                  key={attempt.id}
                  title={attempt.status.replace(/_/g, " ")}
                  copy={`${formatCurrency(attempt.amount)} • ${attempt.createdAt.slice(0, 16).replace("T", " ")}`}
                />
              ))}
              {detail.offers.map((offer) => (
                <TimelineItem
                  key={offer.id}
                  title={`Partner ${offer.status.replace(/_/g, " ")}`}
                  copy={`Response window ${offer.expiresAt.slice(0, 16).replace("T", " ")}`}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#F6F8FA]">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Customer</p>
              <CardTitle className="mt-3 text-xl">{detail.customer?.name ?? "Lead traveler"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-copy">{detail.customer?.email}</p>
              <p className="mt-1 text-sm text-copy">{detail.customer?.phone}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">{label}</p>
      <p className="mt-3 text-xl font-medium text-ink">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">{label}</p>
      <p className="mt-3 text-sm leading-6 text-copy">{value}</p>
    </div>
  );
}

function TimelineItem({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-sm font-medium capitalize text-ink">{title}</p>
      <p className="mt-2 text-sm text-copy-muted">{copy}</p>
    </div>
  );
}
