"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

const PUBLIC_ROUTES = new Set(["/", "/quote", "/checkout"]);

export function AppShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <main className="app-shell">
      {header}
      {children}
    </main>
  );
}
