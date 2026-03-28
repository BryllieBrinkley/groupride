"use client";

import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useTransition } from "react";

import { PublicNavbar } from "@/components/public-navbar";
import type { TripRequestInput, VehicleCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type CheckoutState = {
  pickup: string;
  dropoff: string;
  pickupDateTime: string;
  passengers: number;
  vehicle: VehicleCategory;
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const state = useMemo<CheckoutState>(
    () => ({
      pickup: searchParams.get("pickup") || "Main airport terminal, Nashville, TN",
      dropoff: searchParams.get("dropoff") || "Wedding venue or hotel, Nashville, TN",
      pickupDateTime: searchParams.get("pickupDateTime") || defaultPickupDateTime(),
      passengers: Math.max(1, Number.parseInt(searchParams.get("passengers") || "12", 10) || 12),
      vehicle: parseVehicle(searchParams.get("vehicle"))
    }),
    [searchParams]
  );

  const estimatedPrice = vehiclePrice(state.vehicle, state.passengers);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildTripRequest({
            state,
            name,
            email,
            phone
          })
        )
      });

      const payload = (await response.json()) as { bookingId?: string; error?: string };
      if (!response.ok || !payload.bookingId) {
        setError(payload.error ?? "Unable to create booking.");
        return;
      }

      router.push(`/booking/${payload.bookingId}`);
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f3]">
      <PublicNavbar />
      <div className="mx-auto max-w-md px-6 pb-20 pt-16 lg:px-12">
        <div className="mb-12 border-b border-black/10 pb-8">
          <p className="mb-4 text-xs uppercase tracking-[0.18em] text-black/45">your selection</p>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-xl lowercase text-black">{vehicleName(state.vehicle)}</h1>
              <p className="mt-2 text-sm lowercase text-black/60">
                {state.pickup} to {state.dropoff}
              </p>
              <p className="text-sm lowercase text-black/60">{state.passengers} passengers</p>
            </div>
            <p className="text-2xl text-black">{formatCurrency(estimatedPrice)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Full name" value={name} onChange={setName} type="text" placeholder="Primary contact name" />
          <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="name@email.com" />
          <Field label="Mobile phone" value={phone} onChange={setPhone} type="tel" placeholder="(555) 555-0100" />

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-4 text-sm font-medium lowercase text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "submitting..." : "submit trip request"}
            {!isPending ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </form>

        <p className="mt-8 text-center text-xs uppercase tracking-[0.18em] text-black/45">pay only after a partner confirms</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f7f3]" />}>
      <CheckoutContent />
    </Suspense>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-black/45">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-black/10 bg-white px-4 py-3 text-sm lowercase text-black outline-none transition focus:border-black/30"
      />
    </div>
  );
}

function buildTripRequest({
  state,
  name,
  email,
  phone
}: {
  state: CheckoutState;
  name: string;
  email: string;
  phone: string;
}): TripRequestInput {
  return {
    tripType: "one_way",
    pickupLocation: textToLocation(state.pickup, "Charlotte", "NC"),
    dropoffLocation: textToLocation(state.dropoff, "Charlotte", "NC"),
    stops: [],
    pickupDateTimeLocal: state.pickupDateTime,
    passengers: state.passengers,
    luggageCount: Math.max(0, Math.ceil(state.passengers * 0.5)),
    contactName: name,
    contactEmail: email,
    contactPhone: phone,
    selectedVehicleCategory: state.vehicle,
    paymentMethodToken: `pm_demo_${state.vehicle}_4242`
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

function parseVehicle(value: string | null): VehicleCategory {
  if (value === "suv" || value === "sprinter" || value === "minibus") {
    return value;
  }

  return "sprinter";
}

function vehicleName(category: VehicleCategory) {
  const names: Record<VehicleCategory, string> = {
    suv: "luxury suv",
    sprinter: "sprinter / shuttle van",
    minibus: "mini coach / charter bus"
  };

  return names[category];
}

function vehiclePrice(category: VehicleCategory, passengers: number) {
  const prices: Record<VehicleCategory, number> = {
    suv: Math.max(145, 145 + passengers * 8),
    sprinter: Math.max(220, 220 + passengers * 10),
    minibus: Math.max(350, 350 + passengers * 12)
  };

  return prices[category];
}

function defaultPickupDateTime() {
  const future = new Date(Date.now() + 30 * 60 * 60 * 1000);
  const offset = future.getTimezoneOffset() * 60_000;
  return new Date(future.getTime() - offset).toISOString().slice(0, 16);
}
