import { DashboardShell } from "@/components/shared/DashboardShell";
import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { requireRole } from "@/lib/auth";
import { getAdminDashboard } from "@/lib/services/dashboard";

export default async function AdminAnalyticsPage() {
  await requireRole(["admin"]);
  const { metrics, bookings, operators, notifications } = getAdminDashboard();
  const topRoutes = bookings.slice(0, 5).map((booking) => ({
    route: `${booking.pickupLocation.city} to ${booking.dropoffLocation.city}`,
    bookings: 1,
    revenue: booking.finalAmount ?? booking.quotedAmount ?? 0,
  }));
  const topOperators = operators.slice(0, 5).map((operator) => ({
    operator: operator.companyName,
    bookings: operator.completedTrips,
    revenue: 0,
  }));
  const recentActivity = notifications.slice(0, 5).map((notification) => ({
    activity: notification.title,
    user: notification.recipient,
    date: notification.createdAt,
  }));
  const isLoading = false;

  return (
    <DashboardShell
      sidebar={
        <DashboardNav
          currentPath="/admin/analytics"
          items={[
            { href: "/admin", label: "Overview" },
            { href: "/admin/bookings", label: "Bookings" },
            { href: "/admin/operators", label: "Operators" },
            { href: "/admin/pricing", label: "Pricing" },
            { href: "/admin/analytics", label: "Analytics" },
          ]}
        />
      }
      header={
        <PageHeader
          eyebrow="Analytics"
          title="Platform analytics"
          description="Track revenue, bookings, operator performance, and conversion rates."
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Revenue" value={`$${metrics.confirmedRevenue}`} />
        <StatCard label="Bookings" value={metrics.totalBookings} />
        <StatCard label="Operators" value={metrics.activeOperators} />
        <StatCard label="Open Quotes" value={metrics.openQuotes} />
      </div>

      {/* Placeholder chart cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="rounded-xl border border-line bg-white p-6 h-48 flex items-center justify-center text-muted-foreground">[Revenue Chart]</div>
        <div className="rounded-xl border border-line bg-white p-6 h-48 flex items-center justify-center text-muted-foreground">[Bookings Chart]</div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Top Routes</h2>
      {isLoading ? (
        <LoadingSkeleton className="h-24 w-full rounded-xl" />
      ) : topRoutes.length === 0 ? (
        <EmptyState title="No data" description="No top routes available." />
      ) : (
        <DataTable
          columns={[
            { key: "route", label: "Route" },
            { key: "bookings", label: "Bookings" },
            { key: "revenue", label: "Revenue" },
          ]}
          data={topRoutes}
        />
      )}

      <h2 className="text-xl font-semibold mt-8 mb-2">Top Operators</h2>
      {isLoading ? (
        <LoadingSkeleton className="h-24 w-full rounded-xl" />
      ) : topOperators.length === 0 ? (
        <EmptyState title="No data" description="No top operators available." />
      ) : (
        <DataTable
          columns={[
            { key: "operator", label: "Operator" },
            { key: "bookings", label: "Bookings" },
            { key: "revenue", label: "Revenue" },
          ]}
          data={topOperators}
        />
      )}

      <h2 className="text-xl font-semibold mt-8 mb-2">Recent Activity</h2>
      {isLoading ? (
        <LoadingSkeleton className="h-24 w-full rounded-xl" />
      ) : recentActivity.length === 0 ? (
        <EmptyState title="No activity" description="No recent activity to show." />
      ) : (
        <DataTable
          columns={[
            { key: "activity", label: "Activity" },
            { key: "user", label: "User" },
            { key: "date", label: "Date" },
          ]}
          data={recentActivity}
        />
      )}
    </DashboardShell>
  );
}
