import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  return (
    <div className="space-y-20 pb-16">
      <section className="grid min-h-[78vh] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-3xl">
          <Badge variant="blue">System: GroupRide</Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight leading-tight text-ink sm:text-5xl">
            group travel, handled.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-copy">
            GroupRide coordinates vetted operators for airport groups, team movement, events, and corporate travel. No
            browsing. No listing fatigue. Just a calm request flow built for serious group transportation.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <TrustPill icon={<ShieldCheck className="h-4 w-4" />} label="Vetted operators only" />
            <TrustPill icon={<UsersRound className="h-4 w-4" />} label="Reliable for events, teams, and travel" />
            <TrustPill icon={<Building2 className="h-4 w-4" />} label="No charge until confirmed" />
          </div>

          <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            <SignalStat label="Status" value="Matching" supporting="Queue + operator response" />
            <SignalStat label="Est. response" value="Same day" supporting="Most requests within hours" />
            <SignalStat label="Coverage" value="Charlotte first" supporting="Nationwide intake supported" />
          </div>
        </div>

        <Card className="bg-[#F6F8FA]">
          <CardHeader>
            <Badge variant="neutral">Request a trip</Badge>
            <CardTitle className="mt-5 text-2xl md:text-3xl">Start with where your group is going.</CardTitle>
            <p className="mt-3 text-sm leading-6 text-copy-muted">
              We keep the booking flow guided and fast. Share the trip basics, then we coordinate the right operator.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action="/book" className="space-y-4">
              <Input
                name="destination"
                list="homepage-destinations"
                className="h-14 text-base"
                placeholder="Airport, hotel, venue, or campus"
                defaultValue="Charlotte Douglas Airport, Charlotte, NC"
              />
              <datalist id="homepage-destinations">
                <option value="Charlotte Douglas Airport, Charlotte, NC" />
                <option value="Bank of America Stadium, Charlotte, NC" />
                <option value="Charlotte Convention Center, Charlotte, NC" />
                <option value="Uptown Hotel, Charlotte, NC" />
              </datalist>
              <Button type="submit" size="lg" className="w-full justify-between">
                Find my ride
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Request flow</p>
              <p className="mt-3 text-sm leading-6 text-copy">
                Request received. We coordinate the trip, confirm pricing, and only charge the card after an operator
                accepts.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-t border-line pt-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">
          Trusted for airport movement, event transportation, sports travel, and corporate group coordination
        </p>
      </section>

      <section className="grid gap-8 border-t border-line pt-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="max-w-md">
          <Badge variant="neutral">How it works</Badge>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-ink md:text-3xl">A guided marketplace, not an open directory.</h2>
          <p className="mt-4 text-base leading-7 text-copy">
            Customers see only the next step. Operators get focused request opportunities. Admin keeps the marketplace
            reliable when a trip needs more coordination.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ProcessCard
            number="01"
            title="Tell us the trip"
            copy="Destination first, then the timing, group size, and the few details that matter."
          />
          <ProcessCard
            number="02"
            title="We coordinate the match"
            copy="Relevant operators receive the request. Complex or premium trips can move through concierge review."
          />
          <ProcessCard
            number="03"
            title="Track the request"
            copy="Clear status, honest timing, and a serious operations layer from request through confirmation."
          />
        </div>
      </section>

      <section className="grid gap-6 border-t border-line pt-16 lg:grid-cols-2">
        <Card className="bg-[#F6F8FA]">
          <CardHeader>
            <Badge variant="neutral">For operators</Badge>
            <CardTitle className="mt-5">A cleaner supply workflow.</CardTitle>
            <p className="mt-3 text-sm leading-6 text-copy-muted">
              Operators receive clear request cards, pricing visibility, and an inbox built for quick responses.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/operator" className="inline-flex rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#F9FAFB]">
              Open operator workspace
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-[#F6F8FA]">
          <CardHeader>
            <Badge variant="neutral">For ops teams</Badge>
            <CardTitle className="mt-5">Marketplace control without clutter.</CardTitle>
            <p className="mt-3 text-sm leading-6 text-copy-muted">
              Admin tools keep manual review fast, pricing adjustable, and booking recovery clear when trips need
              intervention.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/admin" className="inline-flex rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#F9FAFB]">
              Open control plane
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function TrustPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-copy">
      <span className="text-accent">{icon}</span>
      {label}
    </div>
  );
}

function SignalStat({ label, value, supporting }: { label: string; value: string; supporting: string }) {
  return (
    <div className="rounded-xl border border-line bg-[#F6F8FA] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-sm text-copy-muted">{supporting}</p>
    </div>
  );
}

function ProcessCard({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <Card className="bg-[#F6F8FA]">
      <CardContent className="pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">{number}</p>
        <h3 className="mt-4 text-xl font-medium text-ink">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-copy">{copy}</p>
      </CardContent>
    </Card>
  );
}
