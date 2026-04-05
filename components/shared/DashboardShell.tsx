"use client";

import React from "react";
import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DashboardShellProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardShell({ sidebar, header, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="page-shell flex gap-7 py-8 md:py-10">
        <aside className="sticky top-7 hidden h-[calc(100vh-3.5rem)] w-[286px] shrink-0 overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_20px_54px_rgba(75,51,39,0.06)] lg:block">
          {sidebar}
        </aside>
        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-40 -mx-1 mb-8 rounded-[2rem] border border-border bg-background/85 px-1 py-1 backdrop-blur">
            <div className="flex items-center gap-3 rounded-[1.6rem] bg-background/70 px-3 py-3.5 lg:hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon-sm" aria-label="Open navigation">
                    <PanelLeft className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm p-0">
                  <DialogTitle className="sr-only">Dashboard navigation</DialogTitle>
                  <div className="rounded-[2rem]">{sidebar}</div>
                </DialogContent>
              </Dialog>
              <p className="premium-eyebrow">Dashboard navigation</p>
            </div>
            <div className="rounded-[1.6rem]">{header}</div>
          </div>
          <main className="space-y-10 pb-14">{children}</main>
        </div>
      </div>
    </div>
  );
}
