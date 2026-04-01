import type { ReactNode } from "react";
import Link from "next/link";
import { CarFront, ChartColumnBig, CircleDollarSign, LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/utils";

export function DashboardNav({
  items,
  currentPath
}: {
  items: Array<{ href: string; label: string }>;
  currentPath: string;
}) {
  const iconMap: Record<string, ReactNode> = {
    overview: <LayoutDashboard className="size-4" />,
    bookings: <CarFront className="size-4" />,
    operators: <ChartColumnBig className="size-4" />,
    pricing: <CircleDollarSign className="size-4" />,
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="px-3 py-5">
        <p className="premium-eyebrow">GroupRide</p>
        <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-foreground">Operations</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Dispatch, pricing, and partner performance in one quiet workspace.
        </p>
      </div>
      <nav className="mt-3 flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const normalizedLabel = item.label.toLowerCase();
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                currentPath === item.href
                  ? "bg-primary text-primary-foreground shadow-[0_14px_32px_rgba(75,51,39,0.18)]"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              )}
            >
              <span>{iconMap[normalizedLabel] ?? <LayoutDashboard className="size-4" />}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="premium-surface mt-4 px-4 py-4">
        <p className="premium-eyebrow">Service standard</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Warm, fast, luxury transportation support for every request.
        </p>
      </div>
    </div>
  );
}
