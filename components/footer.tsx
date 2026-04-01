import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-border/80">
      <div className="page-shell py-16 md:py-20">
        <div className="premium-panel px-8 py-10 md:px-12 md:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="premium-eyebrow">Luxury group transportation</p>
              <h2 className="mt-4 text-3xl font-medium tracking-[-0.05em] text-foreground sm:text-4xl">
                Thoughtful service for every airport run, event, and team trip.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Warm support, vetted operators, and a booking flow that feels calm from first quote to wheels up.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/">
                Plan a trip
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-col gap-5 border-t border-border/80 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-5">
              <Link href="/">Book</Link>
              <Link href="/#how-it-works">How it works</Link>
              <Link href="/become-an-operator">Operators</Link>
              <Link href="/login">Portal</Link>
            </div>
            <p>© {new Date().getFullYear()} GroupRide. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
