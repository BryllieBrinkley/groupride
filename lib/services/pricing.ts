import { getStore } from "@/lib/data/demo-store";
import type { PricingRule, QuoteResult, TripRequestInput, VehicleCategory } from "@/lib/types";

const SERVICE_FEE = 25;

export function getRecommendedVehicle(passengers: number): VehicleCategory {
  if (passengers <= 6) return "suv";
  if (passengers <= 15) return "sprinter";
  return "minibus";
}

export function getFeasibleVehicleCategories(passengers: number): VehicleCategory[] {
  if (passengers <= 6) return ["suv", "sprinter", "minibus"];
  if (passengers <= 15) return ["sprinter", "minibus"];
  return ["minibus", "charter_bus"];
}

export function getPricingRuleForCategory(category: VehicleCategory): PricingRule {
  const rule = getStore().pricingRules.find((entry) => entry.category === category && entry.status === "active");
  if (!rule) {
    throw new Error(`Missing pricing rule for ${category}`);
  }
  return rule;
}

export function buildQuote({
  input,
  pricingRule,
  distanceMiles,
}: {
  input: TripRequestInput;
  pricingRule: PricingRule;
  distanceMiles: number;
}): Pick<QuoteResult, "amount" | "baseFare" | "perMileCharge" | "serviceFee" | "minimumApplied" | "notes"> {
  if (input.tripType === "hourly") {
    const hours = Math.max(pricingRule.minimumHours, 4);
    const baseFare = hours * pricingRule.hourlyRate;
    return {
      amount: baseFare + SERVICE_FEE,
      baseFare,
      perMileCharge: 0,
      serviceFee: SERVICE_FEE,
      minimumApplied: false,
      notes: [`Hourly trips are priced with a ${hours}-hour minimum.`],
    };
  }

  const multiplier = input.tripType === "round_trip" ? 2 : 1;
  const baseFare = pricingRule.baseFare * multiplier;
  const perMileCharge = Math.round(distanceMiles * pricingRule.ratePerMile * multiplier);
  const subtotal = baseFare + perMileCharge;
  const minimumApplied = subtotal < pricingRule.minimumFare;
  const amount = Math.max(pricingRule.minimumFare, subtotal) + SERVICE_FEE;

  return {
    amount,
    baseFare,
    perMileCharge,
    serviceFee: SERVICE_FEE,
    minimumApplied,
    notes: minimumApplied ? ["A service minimum was applied."] : [],
  };
}

export function getServiceFee() {
  return SERVICE_FEE;
}
