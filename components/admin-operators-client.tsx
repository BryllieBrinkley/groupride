"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";

type OperatorRow = {
  id: string;
  companyName: string;
  serviceArea: string;
  fleetSize: number;
  status: string;
  completedRides: number;
  rating: number | null;
  contactEmail: string;
  capacitySummary: string;
  payoutReady: boolean;
};

export function AdminOperatorsClient({ operators }: { operators: OperatorRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return operators.filter((operator) => {
      const matchesQuery =
        !normalizedQuery ||
        [operator.companyName, operator.serviceArea, operator.contactEmail, operator.capacitySummary]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus = status === "all" || operator.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [operators, query, status]);

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Network controls"
        title="Scan coverage, readiness, and fleet fit"
        description="Keep active operators visible, spot service-area gaps, and review whether each partner is ready for higher-value work."
      >
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by company, market, or fleet type"
              className="bg-background pl-11"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </SectionCard>

      {filtered.length === 0 ? (
        <EmptyState
          title="No operators match this view"
          description="Broaden the search or change the status filter to see more marketplace partners."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((operator) => (
            <div key={operator.id} className="premium-panel p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-medium tracking-[-0.04em] text-foreground">
                      {operator.companyName}
                    </h3>
                    <StatusBadge status={operator.status} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{operator.serviceArea}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background px-4 py-3 text-right">
                  <p className="premium-eyebrow">Fleet units</p>
                  <p className="mt-2 text-2xl font-medium tracking-[-0.04em] text-foreground">
                    {operator.fleetSize}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="premium-surface px-4 py-4">
                  <p className="premium-eyebrow">Capacity mix</p>
                  <p className="mt-3 text-sm leading-6 text-foreground">{operator.capacitySummary}</p>
                </div>
                <div className="premium-surface px-4 py-4">
                  <p className="premium-eyebrow">Performance</p>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {operator.completedRides} completed rides
                    {operator.rating ? ` • ${operator.rating.toFixed(1)} rating` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                    {operator.contactEmail}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-primary" />
                    {operator.payoutReady ? "payouts connected" : "payout onboarding needed"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">Dispatch-ready operator profile</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
