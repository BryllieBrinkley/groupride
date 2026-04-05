import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { AdminBookingsClient } from "@/components/admin-bookings-client";
import { requireRole } from "@/lib/auth";
import { getStore } from "@/lib/data/demo-store";
import { listAdminBookings } from "@/lib/services/bookings";

export default async function AdminBookingsPage() {
  await requireRole(["admin"]);
  // Demo-store-backed queue for client demos; swap to persisted datasource when backend is finalized.
  const bookings = listAdminBookings();
  const store = getStore();

  const quotesByBookingId = new Map<string, number>();
  store.quotes.forEach((quote) => {
    quotesByBookingId.set(quote.bookingId, (quotesByBookingId.get(quote.bookingId) ?? 0) + 1);
  });

  const bookingRows = bookings.map((booking) => ({
    id: booking.id,
    reference: booking.reference,
    customerName:
      store.profiles.find((profile) => profile.id === booking.customerProfileId)?.fullName ?? booking.customerProfileId,
    route:
      booking.formattedRouteText ??
      `${booking.pickupLocation.city}, ${booking.pickupLocation.state} to ${booking.dropoffLocation.city}, ${booking.dropoffLocation.state}`,
    pickupDateTimeLocal: booking.pickupDateTimeLocal,
    status: booking.status,
    vehicleLabel: booking.requestedVehicleCategory ?? "vehicle pending",
    operatorName: store.operators.find((operator) => operator.id === booking.operatorId)?.companyName ?? "Unassigned",
    amount: booking.finalAmount ?? booking.quotedAmount ?? 0,
    passengers: booking.passengers,
    quoteCount: quotesByBookingId.get(booking.id) ?? 0,
    paymentStatus: booking.paymentStatus,
  }));

  const kpi = {
    total: bookings.length,
    pending: bookings.filter((booking) => ["pending", "quoted", "awaiting_payment"].includes(booking.status)).length,
    confirmed: bookings.filter((booking) => ["confirmed", "assigned", "in_progress", "completed"].includes(booking.status)).length,
    cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardNav
          currentPath="/admin/bookings"
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
          eyebrow="Booking queue"
          title="Trip queue"
          description="Route requests to transportation partners, update pricing with context, and move bookings forward without leaving the queue."
          meta={
            <>
              <Badge variant="neutral">Control: pricing + supply</Badge>
              <Badge variant="blue">Workflow: coordinated</Badge>
            </>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total bookings" value={kpi.total} />
        <StatCard label="Needs action" value={kpi.pending} />
        <StatCard label="Active trips" value={kpi.confirmed} />
        <StatCard label="Cancelled" value={kpi.cancelled} />
      </div>

      <AdminBookingsClient bookings={bookingRows} />
    </DashboardShell>
  );
}
