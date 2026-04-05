"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";

import { AdminBookingActions } from "@/components/admin-booking-actions";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TripSummaryCard } from "@/components/shared/TripSummaryCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type BookingRow = {
  id: string;
  reference: string;
  customerName: string;
  route: string;
  pickupDateTimeLocal: string;
  status: string;
  vehicleLabel: string;
  operatorName: string;
  amount: number;
  passengers: number;
  quoteCount: number;
  paymentStatus?: string;
};

export function AdminBookingsClient({ bookings }: { bookings: BookingRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string>(bookings[0]?.id ?? "");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          booking.reference,
          booking.customerName,
          booking.route,
          booking.operatorName,
          booking.vehicleLabel,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus = status === "all" || booking.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [bookings, query, status]);

  const selected = filtered.find((booking) => booking.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <SectionCard
          eyebrow="Queue controls"
          title="Filter and prioritize the live booking queue"
          description="Search by customer, route, reference, or operator. Keep urgent work visible and open a booking to act on pricing or supply."
        >
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by route, customer, reference, or operator"
                className="bg-background pl-11"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="quoted">Quoted</option>
              <option value="awaiting_payment">Awaiting payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </SectionCard>

        {filtered.length === 0 ? (
          <EmptyState
            title="No bookings match this view"
            description="Try a broader search or switch the queue status filter to bring more work back into view."
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => setSelectedId(booking.id)}
                className={`w-full text-left transition ${selected?.id === booking.id ? "scale-[1.01]" : ""}`}
              >
                <TripSummaryCard
                  eyebrow={`Reference ${booking.reference}`}
                  title={booking.customerName}
                  route={booking.route}
                  dateTime={booking.pickupDateTimeLocal}
                  passengers={booking.passengers}
                  vehicle={booking.vehicleLabel}
                  amount={booking.amount}
                  status={booking.status}
                  compact
                  className={selected?.id === booking.id ? "border-primary/30 shadow-[0_26px_70px_rgba(75,51,39,0.11)]" : ""}
                  footer={
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                          Operator: {booking.operatorName}
                        </span>
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                          Quotes: {booking.quoteCount}
                        </span>
                        {booking.paymentStatus ? (
                          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                            Payment: {booking.paymentStatus.replace(/_/g, " ")}
                          </span>
                        ) : null}
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm text-foreground">
                        Open workflow
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  }
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {selected ? (
          <>
            <TripSummaryCard
              eyebrow="Selected booking"
              title={selected.customerName}
              route={selected.route}
              dateTime={selected.pickupDateTimeLocal}
              passengers={selected.passengers}
              vehicle={selected.vehicleLabel}
              amount={selected.amount}
              status={selected.status}
              details={[
                { label: "Reference", value: selected.reference },
                { label: "Operator", value: selected.operatorName },
                { label: "Quotes in thread", value: `${selected.quoteCount}` },
                { label: "Payment status", value: selected.paymentStatus?.replace(/_/g, " ") ?? "not started" },
              ]}
            />
            <SectionCard
              eyebrow="Next action"
              title="Update pricing or move the booking forward"
              description="Use one command surface for requesting a quote, confirming the booking, or closing it out when there is no supply."
            >
              <AdminBookingActions bookingId={selected.id} />
            </SectionCard>
            <SectionCard
              eyebrow="Dispatch notes"
              title="What to check before acting"
              description="Keep decision-making consistent across the team."
            >
              <div className="grid gap-3">
                {[
                  `Confirm ${selected.vehicleLabel} still fits ${selected.passengers} passengers and luggage assumptions.`,
                  "If supply is thin, send a revised quote with a customer-facing reason instead of holding the trip in limbo.",
                  "Use confirm only when pricing, availability, and payment readiness are aligned.",
                ].map((note) => (
                  <div key={note} className="premium-surface px-4 py-4 text-sm leading-6 text-muted-foreground">
                    {note}
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        ) : (
          <EmptyState
            title="Select a booking to work it"
            description="Choose a booking from the queue to view dispatch context and use the action panel."
          />
        )}
      </div>
    </div>
  );
}
