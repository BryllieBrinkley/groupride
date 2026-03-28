"use client";

import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { PublicNavbar } from "@/components/public-navbar";
import type { QuoteResult, TripRequestInput, VehicleCategory } from "@/lib/types";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

type QuoteState = {
  pickup: string;
  dropoff: string;
  pickupDateTime: string;
  passengers: number;
};

function QuoteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const state = useMemo<QuoteState>(
    () => ({
      pickup: searchParams.get("pickup") || "Main airport terminal, Nashville, TN",
      dropoff: searchParams.get("dropoff") || "Wedding venue or hotel, Nashville, TN",
      pickupDateTime: searchParams.get("pickupDateTime") || defaultPickupDateTime(),
      passengers: Math.max(1, Number.parseInt(searchParams.get("passengers") || "12", 10) || 12)
    }),
    [searchParams]
  );

  useEffect(() => {
    let active = true;

    const loadQuote = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildTripRequest(state))
        });

        const payload = (await response.json()) as QuoteResult & { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to quote this trip.");
        }

        if (active) {
          setQuote(payload);
        }
      } catch (nextError) {
        if (active) {
          setError(nextError instanceof Error ? nextError.message : "Unable to quote this trip.");
          setQuote(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadQuote();

    return () => {
      active = false;
    };
  }, [state]);

  const goToCheckout = (category: VehicleCategory) => {
    const params = new URLSearchParams({
      pickup: state.pickup,
      dropoff: state.dropoff,
      pickupDateTime: state.pickupDateTime,
      passengers: String(state.passengers),
      vehicle: category
    });

    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f3]">
      <PublicNavbar />
      <div className="mx-auto max-w-md px-6 pb-20 pt-16 lg:px-12">
        <div className="mb-12">
          <h1 className="mb-3 text-2xl lowercase text-black">choose your vehicle</h1>
          <p className="text-sm lowercase text-black/60">
            {state.passengers} passengers · estimated pricing
            <span className="mt-1 block">
              {state.pickup} to {state.dropoff}
            </span>
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/60">
            Calculating your estimate...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : null}

        {quote ? (
          <>
            <div className="mb-8 rounded-2xl border border-black/10 bg-white p-5 text-sm text-black/70">
              <p>{formatNumber(quote.route.distanceMiles)} miles</p>
              <p className="mt-1">{quote.route.estimatedDurationMinutes} minute estimate</p>
              {quote.notes.map((note) => (
                <p key={note} className="mt-3">
                  {note}
                </p>
              ))}
            </div>

            <div className="space-y-4">
              {quote.vehicleChoices.map((choice) => (
                <button
                  key={choice.category}
                  type="button"
                  onClick={() => goToCheckout(choice.category)}
                  className={cn(
                    "w-full rounded-2xl border bg-white p-6 text-left transition",
                    choice.category === quote.recommendedVehicle
                      ? "border-black text-black"
                      : "border-black/10 text-black hover:border-black/35"
                  )}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-base lowercase">{vehicleName(choice.category)}</h2>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-black/45">{choice.badge}</span>
                      </div>
                      <p className="mt-1 text-sm lowercase text-black/60">{choice.reason}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-black/45">
                        {choice.matchedOperatorIds.length} partners in area
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg">{formatCurrency(choice.amount)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 text-sm lowercase text-black/60">
                    select
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f7f3]" />}>
      <QuoteContent />
    </Suspense>
  );
}

function buildTripRequest(state: QuoteState): TripRequestInput {
  return {
    tripType: "one_way",
    pickupLocation: textToLocation(state.pickup, "Charlotte", "NC"),
    dropoffLocation: textToLocation(state.dropoff, "Charlotte", "NC"),
    stops: [],
    pickupDateTimeLocal: state.pickupDateTime,
    passengers: state.passengers,
    luggageCount: Math.max(0, Math.ceil(state.passengers * 0.5)),
    contactName: "Trip organizer",
    contactEmail: "organizer@groupride.app",
    contactPhone: "704-555-0100"
  };
}

function textToLocation(value: string, fallbackCity: string, fallbackState: string) {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    addressLine: parts[0] || value,
    city: parts[1] || fallbackCity,
    state: parts[2] || fallbackState,
    postalCode: ""
  };
}

function vehicleName(category: VehicleCategory) {
  const names: Record<VehicleCategory, string> = {
    suv: "luxury suv",
    sprinter: "sprinter / shuttle van",
    minibus: "mini coach / charter bus"
  };

  return names[category];
}

function defaultPickupDateTime() {
  const future = new Date(Date.now() + 30 * 60 * 60 * 1000);
  const offset = future.getTimezoneOffset() * 60_000;
  return new Date(future.getTime() - offset).toISOString().slice(0, 16);
}
