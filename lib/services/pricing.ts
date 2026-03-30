import type { PricingRule, QuoteResult, TripRequestInput, VehicleCategory } from "@/lib/types";

const SERVICE_FEE = 25;
const MAX_AUTO_DISTANCE_MILES = 50;
const MAX_AUTO_STOPS = 3;
const MAX_AUTO_PRICE = 1000;
const MAX_AUTO_PASSENGERS = 35;

export function getRecommendedVehicle(passengers: number): VehicleCategory {
  if (passengers <= 6) {
    return "suv";
  }
  if (passengers <= 15) {
    return "sprinter";
  }
  return "minibus";
}

export function getFeasibleVehicleCategories(passengers: number): VehicleCategory[] {
  if (passengers <= 6) {
    return ["suv", "sprinter", "minibus"];
  }
  if (passengers <= 15) {
    return ["sprinter", "minibus"];
  }
  return ["minibus"];
}

export function buildQuote({
  input,
  pricingRule,
  distanceMiles
}: {
  input: TripRequestInput;
  pricingRule: PricingRule;
  distanceMiles: number;
}): Pick<QuoteResult, "amount" | "baseFare" | "perMileCharge" | "serviceFee" | "minimumApplied" | "notes"> {
  if (input.tripType === "hourly") {
    const hours = Math.max(pricingRule.minimumHours, 4);
    const amount = hours * pricingRule.hourlyRate + SERVICE_FEE;
    return {
      amount,
      baseFare: hours * pricingRule.hourlyRate,
      perMileCharge: 0,
      serviceFee: SERVICE_FEE,
      minimumApplied: false,
      notes: [`Hourly trips are quoted using a ${hours}-hour minimum and routed to admin review.`]
    };
  }

  const tripMultiplier = input.tripType === "round_trip" ? 2 : 1;
  const rawBase = pricingRule.baseFare * tripMultiplier;
  const rawMileage = distanceMiles * pricingRule.ratePerMile * tripMultiplier;
  const rawAmount = rawBase + rawMileage + SERVICE_FEE;
  const minimumApplied = rawAmount < pricingRule.minimumFare;
  const amount = Math.max(pricingRule.minimumFare, rawAmount);

  return {
    amount: Math.round(amount),
    baseFare: Math.round(rawBase),
    perMileCharge: Math.round(rawMileage),
    serviceFee: SERVICE_FEE,
    minimumApplied,
    notes: minimumApplied ? ["A vehicle minimum was applied to keep the trip serviceable."] : []
  };
}

export function determineReviewTriggers(input: TripRequestInput, amount: number, distanceMiles: number) {
  const triggers = new Set<string>();

  if (input.passengers > MAX_AUTO_PASSENGERS) {
    triggers.add("capacity_overflow");
  }
  if (distanceMiles > MAX_AUTO_DISTANCE_MILES) {
    triggers.add("distance_limit");
  }
  if (input.stops.length > MAX_AUTO_STOPS) {
    triggers.add("stop_limit");
  }
  if (amount > MAX_AUTO_PRICE) {
    triggers.add("high_value");
  }
  if (input.tripType === "hourly") {
    triggers.add("hourly_trip");
  }

  return Array.from(triggers) as Array<
    "capacity_overflow" | "distance_limit" | "stop_limit" | "high_value" | "hourly_trip"
  >;
}

export function getServiceFee() {
  return SERVICE_FEE;
}
