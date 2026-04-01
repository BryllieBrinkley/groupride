"use client";

import { useEffect, useRef, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SectionEyebrow } from "@/components/shared/SectionEyebrow";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const libraries: ("places")[] = ["places"];

const VEHICLE_TYPES = [
  "Executive SUV",
  "Sprinter Van",
  "Mini Bus",
  "Charter Bus",
];

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="premium-surface px-5 py-5">
      <div className="text-3xl font-medium tracking-[-0.04em] text-foreground">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
      <CheckCircle2 className="size-3.5 text-primary" />
      {text}
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
      if (place.formatted_address && !regions.includes(place.formatted_address)) {
        setRegions([...regions, place.formatted_address]);
        onChange("");
      }
    });
  }, [isLoaded, onChange, regions, setRegions]);

  return (
    <FormField label="Service area" htmlFor="service-area">
      <Input
        id="service-area"
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter city, region, or service area"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {regions.map((region) => (
          <span
            key={region}
            className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground"
          >
            {region}
            <button
              type="button"
              className="ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => setRegions(regions.filter((r) => r !== region))}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </FormField>
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
    <FormField label="Fleet size" htmlFor="fleet-size">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-xl text-muted-foreground"
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          -
        </button>

        <Input
          id="fleet-size"
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="max-w-28 text-center"
        />

        <button
          type="button"
          className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-xl text-muted-foreground"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </FormField>
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
    <FormField label="Vehicle types">
      <div className="flex flex-wrap gap-2">
        {VEHICLE_TYPES.map((type) => (
          <button
            type="button"
            key={type}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              selected.includes(type)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
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
    </FormField>
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
    <form className="space-y-5">
      <FormField label="Company name" htmlFor="company-name">
        <Input
          id="company-name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Your company name"
        />
      </FormField>

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

      <FormField label="Phone number" htmlFor="phone">
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-5555"
        />
      </FormField>

      <FormField label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </FormField>

      <Button size="lg" className="mt-3 w-full" id="become-operator-cta">
        Submit application
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}

export default function BecomeAnOperatorPage() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <Navbar />

      <main className="page-shell py-16 md:py-20">
        <section className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <SectionEyebrow>Operator network</SectionEyebrow>
            <h1 className="mt-6 text-5xl font-medium leading-[0.95] tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl">
              Grow your fleet business with GroupRide.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
              Access weddings, airport runs, sports teams, corporate events, and high-value transportation requests without spending hours finding the next customer.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <StatBlock value="24/7" label="Trip requests" />
              <StatBlock value="Weekly" label="Payouts" />
              <StatBlock value="Nationwide" label="Demand" />
            </div>
          </div>

          <div className="flex justify-center">
            <Card className="w-full max-w-xl p-8 md:p-10">
              <div className="text-center">
                <SectionEyebrow className="justify-center">Step 1 of 3</SectionEyebrow>
                <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] text-foreground">
                  Apply to join the network
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Tell us about your business, coverage, and fleet so we can review the fit quickly.
                </p>
              </div>

              <div className="mt-8">
                <OperatorApplicationForm />
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <TrustItem text="Weekly payouts" />
                <TrustItem text="Commercial operator network" />
                <TrustItem text="No upfront joining fees" />
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
