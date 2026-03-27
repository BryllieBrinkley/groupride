"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuoteResult, TripIntent, TripRequestInput, VehicleCategory } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

const SUGGESTIONS = [
  "Charlotte Douglas Airport, Charlotte, NC",
  "Uptown Hotel, Charlotte, NC",
  "Bank of America Stadium, Charlotte, NC",
  "Charlotte Convention Center, Charlotte, NC"
];

const futureDate = (hours: number) => {
  const future = new Date(Date.now() + hours * 60 * 60 * 1000);
  const offset = future.getTimezoneOffset() * 60_000;
  return new Date(future.getTime() - offset).toISOString().slice(0, 16);
};

type ScreenKey =
  | "intent"
  | "airportArrival"
  | "airportFlight"
  | "teamMultiDay"
  | "teamReturn"
  | "planning"
  | "destination"
  | "details"
  | "vehicle"
  | "checkout";

export function BookingPlanner({ initialDestination = "" }: { initialDestination?: string }) {
  const router = useRouter();
  const [screenIndex, setScreenIndex] = useState(0);
  const [tripIntent, setTripIntent] = useState<TripIntent | null>(null);
  const [arrivingByFlight, setArrivingByFlight] = useState<boolean | null>(null);
  const [flightNumber, setFlightNumber] = useState("");
  const [flightArrivalTime, setFlightArrivalTime] = useState(futureDate(30));
  const [multiDay, setMultiDay] = useState<boolean | null>(null);
  const [needsReturnTrip, setNeedsReturnTrip] = useState<boolean | null>(null);
  const [planningHelp, setPlanningHelp] = useState<boolean | null>(null);
  const [destinationText, setDestinationText] = useState(initialDestination || "Charlotte Douglas Airport, Charlotte, NC");
  const [pickupText, setPickupText] = useState("500 S Tryon St, Charlotte, NC");
  const [pickupDateTime, setPickupDateTime] = useState(futureDate(30));
  const [passengers, setPassengers] = useState(10);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCategory | null>(null);
  const [contactName, setContactName] = useState("Morgan Lee");
  const [contactPhone, setContactPhone] = useState("704-555-0110");
  const [contactEmail, setContactEmail] = useState("planner@acmeevents.com");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("10/28");
  const [cvc, setCvc] = useState("123");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const screens = useMemo(() => {
    const flow: ScreenKey[] = ["intent"];
    if (tripIntent === "airport") {
      flow.push("airportArrival");
      if (arrivingByFlight) {
        flow.push("airportFlight");
      }
    }
    if (tripIntent === "team") {
      flow.push("teamMultiDay", "teamReturn");
    }
    flow.push("planning", "destination", "details", "vehicle", "checkout");
    return flow;
  }, [arrivingByFlight, tripIntent]);

  const currentScreen = screens[Math.min(screenIndex, screens.length - 1)];
  const conciergeTrip =
    Boolean(planningHelp) ||
    (tripIntent === "airport" && Boolean(arrivingByFlight)) ||
    (tripIntent === "team" && (Boolean(multiDay) || Boolean(needsReturnTrip)));

  const parsedDestination = useMemo(() => textToLocation(destinationText), [destinationText]);
  const parsedPickup = useMemo(
    () => textToLocation(pickupText, parsedDestination.city, parsedDestination.state),
    [pickupText, parsedDestination.city, parsedDestination.state]
  );

  const titles: Record<ScreenKey, string> = {
    intent: "What kind of trip are you planning?",
    airportArrival: "Are you arriving by flight?",
    airportFlight: "Add your flight details",
    teamMultiDay: "Is this a multi-day trip?",
    teamReturn: "Do you need a return trip?",
    planning: "Do you need help planning the full trip?",
    destination: "Where is your group going?",
    details: "When and where should we pick everyone up?",
    vehicle: conciergeTrip ? "Here is the best starting point" : "Choose your ride",
    checkout: "Who should we contact for this trip?"
  };

  const buildPayload = (vehicleCategory?: VehicleCategory): TripRequestInput => ({
    tripIntent: tripIntent ?? undefined,
    planningHelp: planningHelp ?? undefined,
    conciergeTrip,
    arrivingByFlight: arrivingByFlight ?? undefined,
    flightNumber: flightNumber || undefined,
    flightArrivalTime: arrivingByFlight ? flightArrivalTime : undefined,
    multiDay: multiDay ?? undefined,
    needsReturnTrip: needsReturnTrip ?? undefined,
    tripType: needsReturnTrip ? "round_trip" : "one_way",
    pickupLocation: parsedPickup,
    dropoffLocation: parsedDestination,
    stops: [],
    pickupDateTimeLocal: pickupDateTime,
    returnDateTimeLocal: needsReturnTrip ? futureDate(36) : undefined,
    passengers,
    luggageCount: Math.max(0, Math.ceil(passengers * 0.5)),
    contactName,
    contactEmail,
    contactPhone,
    createAccount: false,
    selectedVehicleCategory: vehicleCategory,
    paymentMethodToken: vehicleCategory ? `pm_demo_${vehicleCategory}_${cardNumber.replace(/\D/g, "").slice(-4) || "4242"}` : undefined
  });

  const fetchQuote = async (vehicleCategory?: VehicleCategory) => {
    const response = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(vehicleCategory))
    });
    const payload = (await response.json()) as QuoteResult & { error?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? "Unable to quote this trip.");
    }
    setQuote(payload);
    setSelectedVehicle(vehicleCategory ?? payload.recommendedVehicle);
    return payload;
  };

  const next = () => {
    setError(null);
    setScreenIndex((current) => Math.min(current + 1, screens.length - 1));
  };

  const goBack = () => {
    setError(null);
    setScreenIndex((current) => Math.max(current - 1, 0));
  };

  const handleIntentSelect = (value: TripIntent) => {
    setTripIntent(value);
    setArrivingByFlight(null);
    setFlightNumber("");
    setMultiDay(null);
    setNeedsReturnTrip(null);
    setPlanningHelp(null);
    next();
  };

  const handlePlanningHelp = (value: boolean) => {
    setPlanningHelp(value);
    next();
  };

  const runDetailsStep = () => {
    if (!pickupText.trim()) {
      setError("Add a pickup spot first.");
      return;
    }
    startTransition(async () => {
      try {
        await fetchQuote();
        next();
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to continue.");
      }
    });
  };

  const submitRequest = () => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 12 || expiry.length < 4 || cvc.length < 3) {
      setError("Add card details to finish your request.");
      return;
    }
    if (!selectedVehicle) {
      setError("Choose a ride first.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(selectedVehicle))
      });
      const payload = (await response.json()) as { bookingId?: string; error?: string };
      if (!response.ok || !payload.bookingId) {
        setError(payload.error ?? "Unable to send your request.");
        return;
      }
      router.push(`/booking/${payload.bookingId}`);
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Card className="bg-[#F6F8FA]">
        <CardContent className="p-6 sm:p-8 lg:p-10">
          <ProgressHeader currentStep={screenIndex + 1} totalSteps={screens.length} title={titles[currentScreen]} />

        {conciergeTrip && currentScreen !== "intent" ? (
          <div className="mt-6 rounded-xl border border-line bg-white px-4 py-3 text-sm text-copy">
            Concierge trip: we will help coordinate the larger travel plan, not just the ride.
          </div>
        ) : null}

        <div className="mt-8">
          {currentScreen === "intent" ? (
            <ChoiceScreen
              options={[
                { label: "Airport trip", value: "airport" },
                { label: "Event or wedding", value: "event" },
                { label: "Team or sports", value: "team" },
                { label: "Corporate", value: "corporate" },
                { label: "Other", value: "other" }
              ]}
              onSelect={(value) => handleIntentSelect(value as TripIntent)}
            />
          ) : null}

          {currentScreen === "airportArrival" ? (
            <ChoiceScreen
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]}
              onSelect={(value) => {
                setArrivingByFlight(value === "yes");
                next();
              }}
            />
          ) : null}

          {currentScreen === "airportFlight" ? (
            <SingleQuestionScreen
              description="We use this to keep the pickup aligned with the arrival."
              content={
                <div className="grid gap-4 md:grid-cols-2">
                  <Label>
                    Flight number
                    <Input className="mt-2" value={flightNumber} onChange={(event) => setFlightNumber(event.target.value)} />
                  </Label>
                  <Label>
                    Arrival time
                    <Input
                      type="datetime-local"
                      className="mt-2"
                      value={flightArrivalTime}
                      onChange={(event) => setFlightArrivalTime(event.target.value)}
                    />
                  </Label>
                </div>
              }
            />
          ) : null}

          {currentScreen === "teamMultiDay" ? (
            <ChoiceScreen
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]}
              onSelect={(value) => {
                setMultiDay(value === "yes");
                next();
              }}
            />
          ) : null}

          {currentScreen === "teamReturn" ? (
            <ChoiceScreen
              options={[
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
              ]}
              onSelect={(value) => {
                setNeedsReturnTrip(value === "yes");
                next();
              }}
            />
          ) : null}

          {currentScreen === "planning" ? (
            <ChoiceScreen
              options={[
                { label: "Yes, help me plan everything", value: "yes" },
                { label: "No, just transportation", value: "no" }
              ]}
              onSelect={(value) => handlePlanningHelp(value === "yes")}
            />
          ) : null}

          {currentScreen === "destination" ? (
            <SingleQuestionScreen
              description="Start with the final destination. We will guide the rest."
              content={
                <>
                  <Input
                    list="groupride-destinations"
                    className="h-14 text-base"
                    placeholder="Where is your group going?"
                    value={destinationText}
                    onChange={(event) => setDestinationText(event.target.value)}
                  />
                  <datalist id="groupride-destinations">
                    {SUGGESTIONS.map((suggestion) => (
                      <option key={suggestion} value={suggestion} />
                    ))}
                  </datalist>
                </>
              }
            />
          ) : null}

          {currentScreen === "details" ? (
            <SingleQuestionScreen
              description="Give us the pickup spot, ride time, and group size."
              content={
                <div className="grid gap-4 md:grid-cols-2">
                  <Label className="md:col-span-2">
                    Pickup spot
                    <Input
                      list="groupride-destinations"
                      className="mt-2"
                      placeholder="Where should we pick everyone up?"
                      value={pickupText}
                      onChange={(event) => setPickupText(event.target.value)}
                    />
                  </Label>
                  <Label>
                    Ride time
                    <Input
                      type="datetime-local"
                      className="mt-2"
                      value={pickupDateTime}
                      onChange={(event) => setPickupDateTime(event.target.value)}
                    />
                  </Label>
                  <div>
                    <p className="text-sm font-medium text-copy">Group size</p>
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3">
                      <button type="button" className="text-xl font-semibold text-copy-muted" onClick={() => setPassengers(Math.max(1, passengers - 1))}>
                        -
                      </button>
                      <span className="text-base font-semibold text-ink">{passengers} riders</span>
                      <button type="button" className="text-xl font-semibold text-copy-muted" onClick={() => setPassengers(Math.min(100, passengers + 1))}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              }
            />
          ) : null}

          {currentScreen === "vehicle" && quote ? (
            <VehicleStep
              quote={quote}
              conciergeTrip={conciergeTrip}
              selectedVehicle={selectedVehicle}
              onSelect={(category) => {
                setSelectedVehicle(category);
                if (quote.recommendedVehicle !== category) {
                  startTransition(async () => {
                    try {
                      await fetchQuote(category);
                    } catch (nextError) {
                      setError(nextError instanceof Error ? nextError.message : "Unable to update the ride.");
                    }
                  });
                }
              }}
              showBreakdown={showBreakdown}
              setShowBreakdown={setShowBreakdown}
            />
          ) : null}

          {currentScreen === "checkout" && quote ? (
            <CheckoutStep
              quote={quote}
              conciergeTrip={conciergeTrip}
              selectedVehicle={selectedVehicle}
              contactName={contactName}
              setContactName={setContactName}
              contactPhone={contactPhone}
              setContactPhone={setContactPhone}
              contactEmail={contactEmail}
              setContactEmail={setContactEmail}
              cardNumber={cardNumber}
              setCardNumber={setCardNumber}
              expiry={expiry}
              setExpiry={setExpiry}
              cvc={cvc}
              setCvc={setCvc}
            />
          ) : null}
        </div>

          {error ? <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <div className="mt-8 flex items-center justify-between gap-4">
            <Button type="button" variant="secondary" onClick={goBack} disabled={screenIndex === 0 || isPending}>
              Back
            </Button>

            {currentScreen === "airportFlight" ? (
              <Button type="button" className="min-w-44" onClick={next} disabled={isPending}>
                Continue
              </Button>
            ) : null}
            {currentScreen === "destination" ? (
              <Button
                type="button"
                className="min-w-44"
                onClick={() => {
                  if (!destinationText.trim()) {
                    setError("Add a destination first.");
                    return;
                  }
                  next();
                }}
                disabled={isPending}
              >
                Continue
              </Button>
            ) : null}
            {currentScreen === "details" ? (
              <Button type="button" className="min-w-44" onClick={runDetailsStep} disabled={isPending}>
                {isPending ? "Finding options..." : "See options"}
              </Button>
            ) : null}
            {currentScreen === "vehicle" ? (
              <Button
                type="button"
                className="min-w-44"
                onClick={() => {
                  if (!selectedVehicle) {
                    setError("Choose an option first.");
                    return;
                  }
                  next();
                }}
                disabled={isPending}
              >
                Continue
              </Button>
            ) : null}
            {currentScreen === "checkout" ? (
              <Button type="button" className="min-w-44" onClick={submitRequest} disabled={isPending}>
                {isPending ? "Sending..." : conciergeTrip ? "Send planning request" : "Send request"}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressHeader({ currentStep, totalSteps, title }: { currentStep: number; totalSteps: number; title: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm font-medium text-copy-muted">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>Queue: active</span>
      </div>
      <div className="h-2 rounded-full bg-[#E5E7EB]">
        <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
      </div>
      <div>
        <Badge variant="neutral">System: guided booking</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1>
      </div>
    </div>
  );
}

function ChoiceScreen({
  options,
  onSelect
}: {
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className="rounded-xl border border-line bg-white px-5 py-5 text-left text-base font-semibold text-ink transition hover:border-accent hover:bg-accentSoft"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SingleQuestionScreen({
  description,
  content
}: {
  description: string;
  content: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <p className="text-lg leading-7 text-copy">{description}</p>
      {content}
    </div>
  );
}

function VehicleStep({
  quote,
  conciergeTrip,
  selectedVehicle,
  onSelect,
  showBreakdown,
  setShowBreakdown
}: {
  quote: QuoteResult;
  conciergeTrip: boolean;
  selectedVehicle: VehicleCategory | null;
  onSelect: (category: VehicleCategory) => void;
  showBreakdown: boolean;
  setShowBreakdown: (value: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-lg leading-7 text-copy">
        {conciergeTrip
          ? "We have picked a strong transportation starting point while our team reviews the wider trip plan."
          : "Here are the strongest transportation options for this trip."}
      </p>

      <div className="grid gap-4">
        {quote.vehicleChoices.map((choice) => {
          const isSelected = selectedVehicle === choice.category;
          return (
            <button
              key={choice.category}
              type="button"
              onClick={() => onSelect(choice.category)}
              className={`rounded-xl border p-5 text-left transition ${
                isSelected ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:border-accent hover:bg-accentSoft"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${isSelected ? "bg-white/15 text-white" : "bg-accentSoft text-ink"}`}>
                      {choice.badge}
                    </span>
                    {isSelected ? <CheckCircle2 className="h-5 w-5" /> : null}
                  </div>
                  <p className="mt-4 text-2xl font-semibold">{labelForCategory(choice.category)}</p>
                  <p className={`mt-2 text-sm ${isSelected ? "text-white/85" : "text-copy-muted"}`}>{choice.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-semibold">{formatCurrency(choice.amount)}</p>
                  <p className={`mt-2 text-sm ${isSelected ? "text-white/85" : "text-copy-muted"}`}>Transparent pricing</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="flex items-center gap-2 text-sm font-semibold text-ink"
        onClick={() => setShowBreakdown(!showBreakdown)}
      >
        {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {showBreakdown ? "Hide price details" : "Show price details"}
      </button>

      {showBreakdown ? (
        <div className="rounded-xl border border-line bg-white p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <BreakdownRow label="Base price" value={formatCurrency(quote.baseFare)} />
            <BreakdownRow label="Distance" value={formatCurrency(quote.perMileCharge)} />
            <BreakdownRow label="Service fee" value={formatCurrency(quote.serviceFee)} />
          </div>
          <p className="mt-4 text-sm text-copy-muted">
            {formatNumber(quote.route.distanceMiles)} miles • {quote.route.estimatedDurationMinutes} minutes
          </p>
        </div>
      ) : null}
    </div>
  );
}

function CheckoutStep({
  quote,
  conciergeTrip,
  selectedVehicle,
  contactName,
  setContactName,
  contactPhone,
  setContactPhone,
  contactEmail,
  setContactEmail,
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
  cvc,
  setCvc
}: {
  quote: QuoteResult;
  conciergeTrip: boolean;
  selectedVehicle: VehicleCategory | null;
  contactName: string;
  setContactName: (value: string) => void;
  contactPhone: string;
  setContactPhone: (value: string) => void;
  contactEmail: string;
  setContactEmail: (value: string) => void;
  cardNumber: string;
  setCardNumber: (value: string) => void;
  expiry: string;
  setExpiry: (value: string) => void;
  cvc: string;
  setCvc: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-white p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-copy-muted">
          {conciergeTrip ? "Planning request" : "Transportation request"}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-ink">{labelForCategory(selectedVehicle ?? quote.recommendedVehicle)}</p>
            <p className="mt-1 text-sm text-copy-muted">
              {conciergeTrip
                ? "We will review the broader trip details and confirm the transportation plan."
                : "We only charge your card after a transportation partner accepts."}
            </p>
          </div>
          <p className="text-3xl font-semibold text-ink">{formatCurrency(quote.amount)}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Label>
          Name
          <Input className="mt-2" value={contactName} onChange={(event) => setContactName(event.target.value)} />
        </Label>
        <Label>
          Phone
          <Input className="mt-2" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
        </Label>
        <Label className="md:col-span-2">
          Email
          <Input className="mt-2" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
        </Label>
        <Label className="md:col-span-2">
          Card number
          <Input className="mt-2" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} />
        </Label>
        <Label>
          Expiry
          <Input className="mt-2" placeholder="MM/YY" value={expiry} onChange={(event) => setExpiry(event.target.value)} />
        </Label>
        <Label>
          CVC
          <Input className="mt-2" value={cvc} onChange={(event) => setCvc(event.target.value)} />
        </Label>
      </div>

      <div className="rounded-xl border border-line bg-[#F6F8FA] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy-muted">Before you send</p>
        <p className="mt-2 text-sm leading-6 text-copy">No charge until confirmed. Vetted operators only. Most trips are matched within a few hours.</p>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-[#F6F8FA] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copy-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

function labelForCategory(category: VehicleCategory) {
  if (category === "suv") return "SUV";
  if (category === "sprinter") return "Sprinter van";
  return "Mini bus";
}

function textToLocation(value: string, fallbackCity = "Charlotte", fallbackState = "NC") {
  const [addressLine, city, state] = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    addressLine: addressLine || value || "Charlotte pickup",
    city: city || fallbackCity,
    state: (state || fallbackState).slice(0, 2).toUpperCase(),
    postalCode: ""
  };
}
