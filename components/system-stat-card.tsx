import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function SystemStatCard({
  label,
  value,
  supporting,
  icon
}: {
  label: string;
  value: string;
  supporting?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="bg-[#F6F8FA]">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
          </div>
          {icon ? <div className="text-copy-muted">{icon}</div> : null}
        </div>
        {supporting ? <p className="mt-3 text-sm leading-6 text-copy-muted">{supporting}</p> : null}
      </CardContent>
    </Card>
  );
}
