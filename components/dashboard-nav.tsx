import Link from "next/link";

import { cn } from "@/lib/utils";

export function DashboardNav({
  items,
  currentPath
}: {
  items: Array<{ href: string; label: string }>;
  currentPath: string;
}) {
  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition",
            currentPath === item.href ? "bg-ink text-white" : "border border-line bg-white text-copy-muted hover:bg-surface hover:text-ink"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
