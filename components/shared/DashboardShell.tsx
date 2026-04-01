import React from "react";

interface DashboardShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardShell({ sidebar, header, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:block w-64 border-r border-border bg-white/80 backdrop-blur">
        {sidebar}
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border shadow-sm">
          {header}
        </header>
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
