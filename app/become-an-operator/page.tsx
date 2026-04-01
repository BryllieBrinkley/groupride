"use client";

import { useEffect, useRef, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const libraries: ("places")[] = ["places"];

const VEHICLE_TYPES = [
  "Executive SUV",
  "Sprinter Van",
  "Mini Bus",
  "Charter Bus"
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#e7dfd3] bg-[#f3e9db] px-4 py-1 text-sm font-medium lowercase tracking-wide text-[#a68a6d]">
      {children}
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-medium text-black">{value}</div>
      <div className="mt-1 text-sm text-black/50">{label}</div>
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#e7dfd3] bg-[#f3e9db] px-3 py-1 text-xs font-medium text-black/45">
      <span className="inline-block h-2 w-2 rounded-full bg-[#a68a6d]" />
      {text}
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-black/60">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-black/10 bg-[#f7f4ef] px-4 py-4 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/30"
      />
    </div>
  );
}

function ServiceAreaField({
  value,
  onChange,
  regions,
  setRegions
}: {
  value: string;
  onChange: (value: string) => void;
  regions: string[];
  setRegions: (regions: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  });

  useEffect(() => {
    if (!isLoaded || !window.google || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["(regions)"]
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (
        place.formatted_address &&
        !regions.includes(place.formatted_address)
      ) {
        setRegions([...regions, place.formatted_address]);
        onChange("");
      }
    });
  }, [isLoaded, regions, onChange, setRegions]);

  return (
    <div>
      <Label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-black/60">
        Service area
      </Label>

      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter city, region, or service area"
        className="rounded-2xl border border-black/10 bg-[#f7f4ef] px-4 py-4 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/30"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {regions.map((region) => (
          <span
            key={region}
            className="inline-flex items-center rounded-full border border-[#e7dfd3] bg-[#f3e9db] px-3 py-1 text-xs font-medium text-[#a68a6d]"
          >
            {region}
            <button
              type="button"
              className="ml-2 text-[#a68a6d] hover:text-[#3d2c1e]"
              onClick={() =>
                setRegions(regions.filter((r) => r !== region))
              }
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function FleetSizeField({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-black/60">
        Fleet size
      </Label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e7dfd3] bg-[#f3e9db] text-lg text-[#a68a6d]"
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          -
        </button>

        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 rounded-2xl border border-black/10 bg-[#f7f4ef] px-2 py-3 text-center text-lg text-black outline-none focus:border-black/30"
        />

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e7dfd3] bg-[#f3e9db] text-lg text-[#a68a6d]"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function VehicleTypesField({
  selected,
  setSelected
}: {
  selected: string[];
  setSelected: (value: string[]) => void;
}) {
  return (
    <div>
      <Label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-black/60">
        Vehicle types
      </Label>

      <div className="flex flex-wrap gap-2">
        {VEHICLE_TYPES.map((type) => (
          <button
            type="button"
            key={type}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selected.includes(type)
                ? "border-[#2d211b] bg-[#2d211b] text-white"
                : "border-[#e7dfd3] bg-[#f3e9db] text-[#a68a6d] hover:bg-[#e7dfd3]"
            }`}
            onClick={() =>
              setSelected(
                selected.includes(type)
                  ? selected.filter((item) => item !== type)
                  : [...selected, type]
              )
            }
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

function OperatorApplicationForm() {
  const [company, setCompany] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [fleetSize, setFleetSize] = useState(1);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form className="space-y-6">
      <FormField
        label="Company name"
        name="company"
        value={company}
        onChange={setCompany}
        placeholder="Your company name"
      />

      <ServiceAreaField
        value={serviceArea}
        onChange={setServiceArea}
        regions={regions}
        setRegions={setRegions}
      />

      <FleetSizeField value={fleetSize} onChange={setFleetSize} />

      <VehicleTypesField
        selected={vehicleTypes}
        setSelected={setVehicleTypes}
      />

      <FormField
        label="Phone number"
        name="phone"
        type="tel"
        value={phone}
        onChange={setPhone}
        placeholder="(555) 555-5555"
      />

      <FormField
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@company.com"
      />

      <Button
        className="mt-2 w-full rounded-2xl bg-[#2d211b] py-4 text-lg font-semibold text-white hover:bg-black"
        id="become-operator-cta"
      >
        submit application
      </Button>
    </form>
  );
}

export default function BecomeAnOperatorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f4ef]">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-32 px-4 py-16 sm:px-8">
        <section className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div className="max-w-xl">
            <SectionEyebrow>operator network</SectionEyebrow>

            <h1 className="mb-8 mt-6 text-6xl font-normal leading-[0.92] tracking-[-0.06em] text-black lowercase lg:text-7xl">
              grow your fleet business
              <br />
              with groupride.
            </h1>

            <p className="mb-12 max-w-lg text-xl text-black/60">
              Get access to weddings, airport runs, sports teams, corporate
              events, and high-value transportation requests without spending
              hours finding customers.
            </p>

            <div className="mb-12 flex gap-12">
              <StatBlock value="24/7" label="trip requests" />
              <StatBlock value="Weekly" label="payouts" />
              <StatBlock value="Nationwide" label="demand" />
            </div>
          </div>

          <div className="flex justify-center">
            <Card className="w-full max-w-md rounded-[32px] border border-[#e7dfd3] bg-white p-10 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
              <div className="mb-6 text-center text-xs text-black/45">
                Step 1 of 3 · Submit your application
              </div>

              <h2 className="mb-1 text-center text-2xl font-medium text-black">
                apply to join
              </h2>

              <p className="mb-8 text-center text-black/50">
                Tell us about your business and fleet.
              </p>

              <OperatorApplicationForm />

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <TrustItem text="Weekly payouts" />
                <TrustItem text="Commercial operator network" />
                <TrustItem text="No upfront joining fees" />
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}