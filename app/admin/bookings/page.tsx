import { DashboardShell } from "@/components/shared/DashboardShell";
import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { requireRole } from "@/lib/auth";
import { getStore } from "@/lib/data/demo-store";
import { listAdminBookings } from "@/lib/services/bookings";
import { formatCurrency } from "@/lib/utils";


export default async function AdminBookingsPage() {
  await requireRole(["admin"]);
  const bookings = listAdminBookings();
  const store = getStore();
  const isLoading = false; // Replace with actual loading state if needed
  // Example KPIs
  const kpi = {
    total: bookings.length,
    pending: bookings.filter((b: any) => b.status === "pending").length,
    confirmed: bookings.filter((b: any) => b.status === "confirmed").length,
    cancelled: bookings.filter((b: any) => b.status === "cancelled").length,
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
          description="Send requests to transportation partners, adjust pricing with customer approval, and close trips that can’t be fulfilled."
          meta={
            <>
              <Badge variant="neutral">Control: pricing + supply</Badge>
              <Badge variant="blue">Workflow: coordinated</Badge>
            </>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Total bookings" value={kpi.total} />
        <StatCard label="Pending" value={kpi.pending} />
        <StatCard label="Confirmed" value={kpi.confirmed} />
        <StatCard label="Cancelled" value={kpi.cancelled} />
      </div>

      <FilterBar>
        <Input className="max-w-sm bg-background" placeholder="Search bookings..." />
        <select className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none">
          <option>Status</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Cancelled</option>
        </select>
        <Input type="date" className="max-w-[220px] bg-background" />
      </FilterBar>

      {isLoading ? (
        <LoadingSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings found" description="No bookings match your filters." />
      ) : (
        <DataTable
          columns={[
            { key: "customer", label: "Customer", render: (_: any, row: any) => row.customerName },
            { key: "route", label: "Route", render: (_: any, row: any) => `${row.pickupLocation.city}, ${row.pickupLocation.state} to ${row.dropoffLocation.city}, ${row.dropoffLocation.state}` },
            { key: "operator", label: "Operator", render: (_: any, row: any) => row.operatorName ?? "Unassigned" },
            { key: "vehicle", label: "Vehicle", render: (_: any, row: any) => row.vehicleName ?? "TBD" },
            { key: "status", label: "Status", render: (val: any) => <StatusBadge status={val} /> },
            { key: "activeAmount", label: "Amount", render: (val: any) => formatCurrency(val) },
            { key: "pickupDateTimeLocal", label: "Date" },
          ]}
          data={bookings.map((booking) => ({
            ...booking,
            customerName: store.profiles.find((profile) => profile.id === booking.customerProfileId)?.fullName ?? booking.customerProfileId,
            operatorName:
              store.operators.find((operator) => operator.id === booking.operatorId)?.companyName ?? "Unassigned",
            vehicleName: booking.requestedVehicleCategory ?? "TBD",
            activeAmount: booking.finalAmount ?? booking.quotedAmount ?? 0,
          }))}
        />
      )}
    </DashboardShell>
  );
}
