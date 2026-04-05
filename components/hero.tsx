"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { GooglePlaceField } from "@/components/google-place-field";
import { useRouteMetrics } from "@/hooks/use-route-metrics";
import { buildQuotePricingInput, calculateQuoteBreakdown } from "@/lib/services/quote-calculator";
import type { GooglePlaceSelection } from "@/lib/types";

function serializePlace(place: GooglePlaceSelection | null) {
  return place ? JSON.stringify(place) : "";
}

export function Hero() {
  const router = useRouter();

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupPlace, setPickupPlace] = useState<GooglePlaceSelection | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<GooglePlaceSelection | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [passengers, setPassengers] = useState("");
  const { metrics, isLoading: isRouteLoading, error: routeError } = useRouteMetrics({
    pickup: pickupPlace,
    dropoff: dropoffPlace,
  });

  const recommendedVehicle = useMemo(() => {
    const passengerCount = Number(passengers || 0);
    if (passengerCount > 35) return "charter_bus";
    if (passengerCount > 14) return "minibus";
    return "sprinter";
  }, [passengers]);

  const quoteBreakdown = useMemo(() => {
    if (!metrics) {
      return null;
    }

    return calculateQuoteBreakdown(
      buildQuotePricingInput({
        vehicleCategory: recommendedVehicle,
        tripType: "one_way",
        distanceMiles: metrics.distanceMiles,
        driveTimeMinutes: metrics.driveTimeMinutes,
        routeText: metrics.formattedRouteText,
        pickupLabel: pickupPlace?.formattedAddress,
        dropoffLabel: dropoffPlace?.formattedAddress,
        pickupDateTimeLocal: dateTime,
      }),
    );
  }, [dateTime, dropoffPlace?.formattedAddress, metrics, pickupPlace?.formattedAddress, recommendedVehicle]);

  const handleGetQuote = () => {
    const params = new URLSearchParams({
      pickup,
      dropoff,
      datetime: dateTime,
      passengers,
    });

    if (pickupPlace) {
      params.set("pickup_place", serializePlace(pickupPlace));
    }

    if (dropoffPlace) {
      params.set("dropoff_place", serializePlace(dropoffPlace));
    }
    if (metrics) {
      params.set("distance", metrics.distanceMiles.toString());
      params.set("duration", metrics.driveTimeMinutes.toString());
      params.set("route_text", metrics.formattedRouteText);
      params.set("pickup_lat", metrics.pickupLat.toString());
      params.set("pickup_lng", metrics.pickupLng.toString());
      params.set("dropoff_lat", metrics.dropoffLat.toString());
      params.set("dropoff_lng", metrics.dropoffLng.toString());
    }

    router.push(`/quote?${params.toString()}`);
  };

  return (
    <section className="min-h-screen bg-[#f7f4ef]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <div className="flex flex-1 flex-col justify-center px-6 pt-30 pb-16 lg:px-14 lg:pt-0 lg:pb-0">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-black/55">
              trusted group transportation
            </div>

            <h1 className="text-[clamp(3rem,7.2vw,5.8rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-black lowercase">
              group travel,
              <br />
              made simple.
            </h1>

            <p className="mt-8 max-w-md text-[clamp(1.02rem,0.35vw+0.95rem,1.2rem)] leading-8 text-black/60 lowercase">
              book charter buses, sprinter vans, and group transportation in
              minutes.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm lowercase text-black/65">
                airports
              </div>
              <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm lowercase text-black/65">
                weddings
              </div>
              <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm lowercase text-black/65">
                events
              </div>
              <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm lowercase text-black/65">
                sports teams
              </div>
              <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm lowercase text-black/65">
                corporate
              </div>
            </div>

            <div className="mt-14 flex flex-col gap-9">
              <div className="flex items-center gap-8 text-sm lowercase text-black/45">
                <div>
                  <p className="text-2xl font-medium text-black">6–100+</p>
                  <p>passengers</p>
                </div>

                <div className="h-10 w-px bg-black/10" />

                <div>
                  <p className="text-2xl font-medium text-black">24/7</p>
                  <p>availability</p>
                </div>

                <div className="h-10 w-px bg-black/10" />

                <div>
                  <p className="text-2xl font-medium text-black">0</p>
                  <p>upfront charge</p>
                </div>
              </div>
              <a
                href="/become-an-operator"
                id="become-operator-cta"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2d211b] px-8 py-4 text-lg font-semibold lowercase text-white transition hover:bg-black shadow-lg"
              >
                become an operator
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16 lg:px-14 lg:pb-0">
          <div className="w-full max-w-md">
            <div className="rounded-[32px] border border-[#d8d2ca] bg-[#e9e4dd] p-7 shadow-[0_26px_68px_rgba(0,0,0,0.08)] lg:p-9">
              <div className="mb-7">
                <h2 className="text-[1.9rem] font-semibold lowercase text-black">
                  get a quote
                </h2>

                <p className="mt-3 text-[15px] leading-6 lowercase text-black/55">
                  tell us where you're going and we'll match you with the right
                  vehicle.
                </p>
              </div>

              <div className="space-y-5">
                <GooglePlaceField
                  id="hero-pickup"
                  label="pickup"
                  value={pickup}
                  selectedPlace={pickupPlace}
                  onValueChange={setPickup}
                  onPlaceSelect={setPickupPlace}
                  placeholder="airport, hotel, or address"
                  enableCurrentLocation
                />

                <GooglePlaceField
                  id="hero-dropoff"
                  label="dropoff"
                  value={dropoff}
                  selectedPlace={dropoffPlace}
                  onValueChange={setDropoff}
                  onPlaceSelect={setDropoffPlace}
                  placeholder="venue, hotel, or destination"
                />

                <div className="rounded-2xl border border-black/10 bg-[#f7f4ef] px-[1.125rem] py-[1.125rem]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-black/45">
                        live quote summary
                      </p>
                      <p className="mt-2 text-[15px] leading-6 text-black/58">
                        {metrics ? metrics.formattedRouteText : "Select pickup and dropoff to price your route."}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.12em] text-black/40">estimated total</p>
                      <p className="mt-2 text-[1.75rem] font-semibold text-black">
                        {quoteBreakdown ? `$${quoteBreakdown.total.toFixed(0)}` : "--"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-black/8 bg-white/60 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-black/40">distance</p>
                      <p className="mt-2 text-sm text-black/70">
                        {isRouteLoading ? "Calculating..." : metrics ? `${metrics.distanceMiles} miles` : "--"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-black/8 bg-white/60 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-black/40">drive time</p>
                      <p className="mt-2 text-sm text-black/70">
                        {isRouteLoading ? "Calculating..." : metrics ? `${metrics.driveTimeMinutes} min` : "--"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-black/8 bg-white/60 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-black/40">vehicle</p>
                      <p className="mt-2 text-sm text-black/70">{recommendedVehicle.replace("_", " ")}</p>
                    </div>
                  </div>

                  {routeError ? (
                    <p className="mt-3 text-[12px] leading-5 text-[#8c5d50]">{routeError}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-black/45">
                    date & time
                  </label>

                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(event) => setDateTime(event.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-[#f7f4ef] px-4 py-4 text-sm text-black outline-none transition focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-black/45">
                    passengers
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={passengers}
                    onChange={(event) => setPassengers(event.target.value)}
                    placeholder="number of passengers"
                    className="w-full rounded-2xl border border-black/10 bg-[#f7f4ef] px-4 py-4 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/30"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGetQuote}
                  className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2d211b] px-4 py-4 text-sm font-medium lowercase text-white transition hover:bg-black"
                >
                  get my quote
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <p className="pt-2 text-center text-xs lowercase text-black/40">
                  no charge until confirmed • vetted transportation partners
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
