"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

export function Hero() {
  const router = useRouter();

  const pickupRef = useRef<HTMLInputElement | null>(null);
  const dropoffRef = useRef<HTMLInputElement | null>(null);

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [passengers, setPassengers] = useState("");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  useEffect(() => {
    if (!isLoaded || !window.google) return;

    if (pickupRef.current) {
      const pickupAutocomplete = new window.google.maps.places.Autocomplete(
        pickupRef.current,
        {
          fields: ["formatted_address", "geometry", "name"],
          types: ["geocode"],
        }
      );

      pickupAutocomplete.addListener("place_changed", () => {
        const place = pickupAutocomplete.getPlace();

        if (place.formatted_address) {
          setPickup(place.formatted_address);
        }
      });
    }

    if (dropoffRef.current) {
      const dropoffAutocomplete = new window.google.maps.places.Autocomplete(
        dropoffRef.current,
        {
          fields: ["formatted_address", "geometry", "name"],
          types: ["geocode"],
        }
      );

      dropoffAutocomplete.addListener("place_changed", () => {
        const place = dropoffAutocomplete.getPlace();

        if (place.formatted_address) {
          setDropoff(place.formatted_address);
        }
      });
    }
  }, [isLoaded]);

  const handleGetQuote = () => {
    const params = new URLSearchParams({
      pickup,
      dropoff,
      datetime: dateTime,
      passengers,
    });

    router.push(`/quote?${params.toString()}`);
  };

  return (
    <section className="min-h-screen bg-[#f7f4ef]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        {/* Left Side */}
        <div className="flex flex-1 flex-col justify-center px-6 pt-28 pb-14 lg:px-12 lg:pt-0 lg:pb-0">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-black/55">
              trusted group transportation
            </div>

            <h1 className="text-5xl font-normal leading-[0.92] tracking-[-0.06em] text-black lowercase sm:text-6xl lg:text-7xl">
              group travel,
              <br />
              made simple.
            </h1>

            <p className="mt-8 max-w-md text-lg leading-relaxed text-black/60 lowercase">
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

            <div className="mt-12 flex items-center gap-8 text-sm lowercase text-black/45">
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
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-1 items-center justify-center px-6 pb-14 lg:px-12 lg:pb-0">
          <div className="w-full max-w-md">
            <div className="rounded-[32px] border border-[#d8d2ca] bg-[#e9e4dd] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)] lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-medium lowercase text-black">
                  get a quote
                </h2>

                <p className="mt-2 text-sm lowercase text-black/50">
                  tell us where you're going and we'll match you with the right
                  vehicle.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-black/45">
                    pickup
                  </label>

                  <input
                    ref={pickupRef}
                    type="text"
                    value={pickup}
                    onChange={(event) => setPickup(event.target.value)}
                    placeholder="airport, hotel, or address"
                    className="w-full rounded-2xl border border-black/10 bg-[#f7f4ef] px-4 py-4 text-sm lowercase text-black outline-none transition placeholder:text-black/35 focus:border-black/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-black/45">
                    dropoff
                  </label>

                  <input
                    ref={dropoffRef}
                    type="text"
                    value={dropoff}
                    onChange={(event) => setDropoff(event.target.value)}
                    placeholder="venue, hotel, or destination"
                    className="w-full rounded-2xl border border-black/10 bg-[#f7f4ef] px-4 py-4 text-sm lowercase text-black outline-none transition placeholder:text-black/35 focus:border-black/30"
                  />
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