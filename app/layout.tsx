import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { AppShell } from "@/components/app-shell";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "GroupRide",
  description: "Premium marketplace for large-group transportation—weddings, sports, airports, events, and more."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppShell header={<SiteHeader />}>{children}</AppShell>
      </body>
    </html>
  );
}
