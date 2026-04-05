"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";

type PricingRow = {
  id: string;
  name: string;
  region: string;
  category: string;
  baseFare: number;
  ratePerMile: number;
  minimumFare: number;
  hourlyRate: number;
  status: string;
};

export function AdminPricingClient({ rules }: { rules: PricingRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rules.filter((rule) => {
      const matchesQuery =
        !normalizedQuery ||
        [rule.name, rule.region, rule.category].join(" ").toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "all" || rule.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, rules, status]);

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Pricing controls"
        title="Keep estimate logic easy to inspect"
        description="Review which regional rules are active, what minimums are enforced, and how each vehicle tier is positioned before dispatch sends a quote."
      >
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by rule name, market, or vehicle tier"
              className="bg-background pl-11"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none"
          >
            <option value="all">All rules</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </SectionCard>

      {filtered.length === 0 ? (
        <EmptyState
          title="No pricing rules match this view"
          description="Try a wider search or switch the status filter to compare more estimate rules."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((rule) => (
            <div key={rule.id} className="premium-panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="premium-eyebrow">{rule.region}</p>
                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-foreground">{rule.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{rule.category.replace(/_/g, " ")}</p>
                </div>
                <StatusBadge status={rule.status} />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="premium-surface px-4 py-4">
                  <p className="premium-eyebrow">Base fare</p>
                  <p className="mt-3 text-xl font-medium tracking-[-0.03em] text-foreground">${rule.baseFare}</p>
                </div>
                <div className="premium-surface px-4 py-4">
                  <p className="premium-eyebrow">Per mile</p>
                  <p className="mt-3 text-xl font-medium tracking-[-0.03em] text-foreground">${rule.ratePerMile}</p>
                </div>
                <div className="premium-surface px-4 py-4">
                  <p className="premium-eyebrow">Minimum</p>
                  <p className="mt-3 text-xl font-medium tracking-[-0.03em] text-foreground">${rule.minimumFare}</p>
                </div>
                <div className="premium-surface px-4 py-4">
                  <p className="premium-eyebrow">Hourly</p>
                  <p className="mt-3 text-xl font-medium tracking-[-0.03em] text-foreground">${rule.hourlyRate}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
