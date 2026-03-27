"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PricingRule } from "@/lib/types";

export function PricingRuleEditor({ rule }: { rule: PricingRule }) {
  const router = useRouter();
  const [baseFare, setBaseFare] = useState(String(rule.baseFare));
  const [ratePerMile, setRatePerMile] = useState(String(rule.ratePerMile));
  const [minimumFare, setMinimumFare] = useState(String(rule.minimumFare));
  const [hourlyRate, setHourlyRate] = useState(String(rule.hourlyRate));
  const [minimumHours, setMinimumHours] = useState(String(rule.minimumHours));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const response = await fetch(`/api/admin/pricing/${rule.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseFare: Number(baseFare),
          ratePerMile: Number(ratePerMile),
          minimumFare: Number(minimumFare),
          hourlyRate: Number(hourlyRate),
          minimumHours: Number(minimumHours)
        })
      });
      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to update pricing.");
        return;
      }
      setMessage(payload.message ?? "Pricing saved.");
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl border border-line bg-[#F6F8FA] p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-ink">{rule.category.toUpperCase()}</p>
          <p className="text-sm text-copy-muted">Adjust the deterministic default quote inputs.</p>
        </div>
        <Button disabled={isPending} onClick={save}>
          Save
        </Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <PricingField label="Base fare" value={baseFare} onChange={setBaseFare} />
        <PricingField label="Rate / mile" value={ratePerMile} onChange={setRatePerMile} />
        <PricingField label="Minimum" value={minimumFare} onChange={setMinimumFare} />
        <PricingField label="Hourly rate" value={hourlyRate} onChange={setHourlyRate} />
        <PricingField label="Min hours" value={minimumHours} onChange={setMinimumHours} />
      </div>

      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

function PricingField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Label>
      {label}
      <Input className="mt-2" type="number" value={value} onChange={(event) => onChange(event.target.value)} />
    </Label>
  );
}
