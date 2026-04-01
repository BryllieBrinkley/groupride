import { DashboardShell } from "@/components/shared/DashboardShell";
import { DashboardNav } from "@/components/dashboard-nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { requireRole } from "@/lib/auth";
import { listProfiles } from "@/lib/services/auth";

export default async function AdminUsersPage() {
  await requireRole(["admin"]);
  const users = listProfiles();
  const isLoading = false;
  const kpi = {
    total: users.length,
    customers: users.filter((user) => user.role === "customer").length,
    operators: users.filter((user) => user.role === "operator").length,
    admins: users.filter((user) => user.role === "admin").length,
  };

  return (
    <DashboardShell
      sidebar={
        <DashboardNav
          currentPath="/admin/users"
          items={[
            { href: "/admin", label: "Overview" },
            { href: "/admin/bookings", label: "Bookings" },
            { href: "/admin/operators", label: "Operators" },
            { href: "/admin/pricing", label: "Pricing" },
            { href: "/admin/users", label: "Users" },
          ]}
        />
      }
      header={
        <PageHeader
          eyebrow="User management"
          title="Users"
          description="Manage all platform users, roles, and account statuses."
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Total users" value={kpi.total} />
        <StatCard label="Customers" value={kpi.customers} />
        <StatCard label="Operators" value={kpi.operators} />
        <StatCard label="Admins" value={kpi.admins} />
      </div>

      <FilterBar>
        <Input className="max-w-sm bg-background" placeholder="Search users..." />
        <select className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none">
          <option>Role</option>
          <option>Customer</option>
          <option>Operator</option>
          <option>Admin</option>
        </select>
        <select className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none">
          <option>Status</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>
      </FilterBar>

      {isLoading ? (
        <LoadingSkeleton />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="No users match your filters." />
      ) : (
        <DataTable
          columns={[
            { key: "fullName", label: "Name" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role", render: (val: any) => <StatusBadge status={val} /> },
            { key: "status", label: "Status", render: (val: any) => <StatusBadge status={val} /> },
            { key: "bookingCount", label: "Bookings" },
            { key: "createdAt", label: "Created Date" },
          ]}
          data={users.map((user) => ({ ...user, bookingCount: 0 }))}
        />
      )}
    </DashboardShell>
  );
}
