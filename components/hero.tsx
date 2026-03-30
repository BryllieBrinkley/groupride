"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Hero() {
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
      passengers,
    });

    router.push(`/quote?${params.toString()}`);
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side */}
      <div className="flex flex-1 flex-col justify-center px-6 pt-24 pb-12 lg:px-12 lg:pt-0 lg:pb-0">
        <div className="max-w-md">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal tracking-[-0.05em] leading-[0.95] text-black lowercase">
            group travel,
            <br />
            handled.
          </h1>

          <p className="mt-8 text-lg leading-relaxed text-black/60 lowercase">
            6–100+ passengers
            <br />
            airports / weddings / events / teams / corporate
          </p>

          <p className="mt-10 text-xs uppercase tracking-[0.18em] leading-6 text-black/35">
            no charge until confirmed
            <br />
            vetted transportation partners
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-12 lg:py-0">
        <div className="w-full max-w-sm">
          <div className="rounded-[28px] border border-[#d8d2ca] bg-[#e9e4dd] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.06)] lg:p-8">
            <div className="space-y-4">
              <Field
                label="pickup"
                value={pickup}
                onChange={setPickup}
                placeholder="address or airport"
              />

              <Field
                label="dropoff"
                value={dropoff}
                onChange={setDropoff}
                placeholder="venue, hotel, or final stop"
              />

              <div>
                <label className="mb-2 block text-xs lowercase text-black/55">
                  date & time
                </label>

                <input
                  type="datetime-local"
                  value={pickupDateTime}
                  onChange={(event) => setPickupDateTime(event.target.value)}
                  className="w-full rounded-md border border-black/10 bg-[#f7f4ef] px-4 py-3 text-sm text-black outline-none transition focus:border-black/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs lowercase text-black/55">
                  passengers
                </label>

                <input
                  type="number"
                  min="1"
                  value={passengers}
                  onChange={(event) => setPassengers(event.target.value)}
                  placeholder="number of passengers"
                  className="w-full rounded-md border border-black/10 bg-[#f7f4ef] px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/30"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-[#2d211b] px-4 py-4 text-sm font-medium lowercase text-white transition hover:bg-black"
              >
                find my ride
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs lowercase text-black/55">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-black/10 bg-[#f7f4ef] px-4 py-3 text-sm lowercase text-black outline-none transition placeholder:text-black/35 focus:border-black/30"
      />
    </div>
  );
}

function defaultPickupDateTime() {
  const future = new Date(Date.now() + 30 * 60 * 60 * 1000);
  const offset = future.getTimezoneOffset() * 60_000;
  return new Date(future.getTime() - offset).toISOString().slice(0, 16);
}