"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HomeHero() {
  const router = useRouter();
  const [pickup, setPickup] = useState("Main airport terminal, Nashville, TN");
  const [dropoff, setDropoff] = useState("Wedding venue or hotel, Nashville, TN");
  const [pickupDateTime, setPickupDateTime] = useState(() => defaultPickupDateTime());
  const [passengers, setPassengers] = useState("12");

  const handleSubmit = () => {
    const params = new URLSearchParams({
      pickup,
      dropoff,
      pickupDateTime,
      passengers
    });

    router.push(`/quote?${params.toString()}`);
  };

  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <div className="flex flex-1 flex-col justify-center px-6 pb-12 pt-16 lg:px-12 lg:pb-20 lg:pt-12">
        <div className="max-w-md">
          <h1 className="text-5xl lowercase leading-[0.98] tracking-[-0.04em] sm:text-6xl">
            big groups,
            <br />
            one booking.
          </h1>

          <p className="mt-8 text-base lowercase leading-relaxed text-black/65">
            sprinters, shuttles, party buses, charter buses
            <br />
            weddings, sports, airports, nights out, corporate
          </p>

          <p className="mt-8 text-xs lowercase leading-6 tracking-[0.18em] text-black/45">
            pay when your trip is confirmed
            <br />
            verified transportation partners
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 pb-16 lg:px-12 lg:py-12">
        <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-[0_25px_60px_rgba(0,0,0,0.08)] lg:p-8">
          <div className="space-y-4">
            <Field
              label="Pickup"
              value={pickup}
              onChange={setPickup}
              placeholder="Airport, hotel, or street address"
            />
            <Field
              label="Dropoff"
              value={dropoff}
              onChange={setDropoff}
              placeholder="Venue, stadium, or final stop"
            />

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/50">Date & time</label>
              <input
                type="datetime-local"
                value={pickupDateTime}
                onChange={(event) => setPickupDateTime(event.target.value)}
                className="w-full rounded-md border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm text-black outline-none transition focus:border-black/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/50">Passengers</label>
              <input
                type="number"
                min="1"
                value={passengers}
                onChange={(event) => setPassengers(event.target.value)}
                className="w-full rounded-md border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm text-black outline-none transition focus:border-black/30"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-4 text-sm font-medium lowercase text-white transition hover:opacity-90"
            >
              get an estimate
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/50">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-black/10 bg-[#fafaf7] px-4 py-3 text-sm lowercase text-black outline-none transition focus:border-black/30"
      />
    </div>
  );
}

function defaultPickupDateTime() {
  const future = new Date(Date.now() + 30 * 60 * 60 * 1000);
  const offset = future.getTimezoneOffset() * 60_000;
  return new Date(future.getTime() - offset).toISOString().slice(0, 16);
}
