import { CalendarClock, MapPin, Users, BriefcaseBusiness } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn, formatCurrency } from "@/lib/utils";

type Detail = {
  label: string;
  value: string;
};

interface TripSummaryCardProps {
  eyebrow?: string;
  title: string;
  route: string;
  dateTime?: string;
  passengers?: number | string;
  vehicle?: string;
  amount?: number | null;
  status?: string;
  details?: Detail[];
  compact?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export function TripSummaryCard({
  eyebrow,
  title,
  route,
  dateTime,
  passengers,
  vehicle,
  amount,
  status,
  details = [],
  compact = false,
  footer,
  className,
}: TripSummaryCardProps) {
  const normalizedDetails = [
    dateTime ? { icon: CalendarClock, label: "Pickup", value: dateTime } : null,
    passengers ? { icon: Users, label: "Passengers", value: `${passengers}` } : null,
    vehicle ? { icon: BriefcaseBusiness, label: "Vehicle", value: vehicle.replace(/_/g, " ") } : null,
    ...details.map((detail) => ({ icon: MapPin, label: detail.label, value: detail.value })),
  ].filter(Boolean) as Array<{ icon: typeof CalendarClock; label: string; value: string }>;

  return (
    <div className={cn("premium-panel p-7 md:p-8", compact ? "space-y-6" : "space-y-7", className)}>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-4">
          {eyebrow ? <p className="premium-eyebrow">{eyebrow}</p> : null}
          <div>
            <h3 className="text-[clamp(1.5rem,1.5vw+1.2rem,2rem)] font-semibold tracking-[-0.03em] text-foreground">{title}</h3>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{route}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end md:pt-1">
          {typeof amount === "number" ? (
            <div className="rounded-2xl border border-border bg-background px-5 py-4 text-right">
              <p className="premium-eyebrow">Trip total</p>
              <p className="mt-2 text-[1.65rem] font-semibold tracking-[-0.035em] text-foreground">
                {formatCurrency(amount)}
              </p>
            </div>
          ) : null}
          {status ? <StatusBadge status={status} /> : null}
        </div>
      </div>

      {normalizedDetails.length > 0 ? (
        <div className={cn("grid gap-3.5", compact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4")}>
          {normalizedDetails.map((detail) => {
            const Icon = detail.icon;
            return (
              <div key={`${detail.label}-${detail.value}`} className="premium-surface px-4 py-4.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-4" />
                  <p className="premium-eyebrow">{detail.label}</p>
                </div>
                <p className="mt-3 text-[15px] leading-6 text-foreground">{detail.value}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      {footer ? <div>{footer}</div> : null}
    </div>
  );
}
