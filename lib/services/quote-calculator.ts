import type { QuotePricingBreakdown, QuotePricingInput, TripType, VehicleCategory } from "@/lib/types";

export interface QuoteRulePreset {
  baseFare: number;
  perMileRate: number;
  hourlyRate: number;
  minimumCharge: number;
  airportSurcharge: number;
  luggageSurchargePerBag: number;
}

export const QUOTE_RULES: Record<VehicleCategory, QuoteRulePreset> = {
  suv: {
    baseFare: 95,
    perMileRate: 3.25,
    hourlyRate: 95,
    minimumCharge: 180,
    airportSurcharge: 24,
    luggageSurchargePerBag: 4,
  },
  sprinter: {
    baseFare: 155,
    perMileRate: 4.6,
    hourlyRate: 145,
    minimumCharge: 320,
    airportSurcharge: 32,
    luggageSurchargePerBag: 5,
  },
  minibus: {
    baseFare: 235,
    perMileRate: 5.9,
    hourlyRate: 195,
    minimumCharge: 480,
    airportSurcharge: 38,
    luggageSurchargePerBag: 6,
  },
  charter_bus: {
    baseFare: 420,
    perMileRate: 7.5,
    hourlyRate: 285,
    minimumCharge: 900,
    airportSurcharge: 55,
    luggageSurchargePerBag: 8,
  },
};

export function isLateNightPickup(dateTimeLocal: string) {
  if (!dateTimeLocal) {
    return false;
  }

  const hours = new Date(dateTimeLocal).getHours();
  return hours >= 22 || hours < 5;
}

export function detectAirportSurcharge(routeText: string, pickupLabel?: string, dropoffLabel?: string) {
  const haystack = `${routeText} ${pickupLabel ?? ""} ${dropoffLabel ?? ""}`.toLowerCase();
  return haystack.includes("airport") || haystack.includes("international");
}

export function calculateQuoteBreakdown(input: QuotePricingInput): QuotePricingBreakdown {
  const normalizedTripType: TripType = input.tripType;
  const luggageSurcharge = Math.max(0, input.luggageCount ?? 0) * Math.max(0, input.luggageSurchargePerBag ?? 0);
  const hourlyCharge =
    normalizedTripType === "hourly"
      ? Math.max(2, Math.ceil(input.driveTimeMinutes / 60)) * input.hourlyRate
      : 0;
  const mileageCharge =
    normalizedTripType === "hourly" ? 0 : Math.round(input.distanceMiles * input.perMileRate);
  const subtotal =
    input.baseFare +
    mileageCharge +
    hourlyCharge +
    Math.max(0, input.airportSurcharge ?? 0) +
    luggageSurcharge +
    Math.max(0, input.tolls ?? 0) +
    Math.max(0, input.lateNightFee ?? 0);
  const total = Math.max(input.minimumCharge, subtotal);

  return {
    subtotal,
    total,
    baseFare: input.baseFare,
    mileageCharge,
    hourlyCharge,
    airportSurcharge: Math.max(0, input.airportSurcharge ?? 0),
    luggageSurcharge,
    tolls: Math.max(0, input.tolls ?? 0),
    lateNightFee: Math.max(0, input.lateNightFee ?? 0),
    minimumApplied: total > subtotal,
  };
}

export function buildQuotePricingInput(input: {
  vehicleCategory: VehicleCategory;
  tripType: TripType;
  distanceMiles: number;
  driveTimeMinutes: number;
  routeText: string;
  pickupLabel?: string;
  dropoffLabel?: string;
  luggageCount?: number;
  tolls?: number;
  pickupDateTimeLocal?: string;
}) {
  const rule = QUOTE_RULES[input.vehicleCategory];
  const hasAirportSurcharge = detectAirportSurcharge(input.routeText, input.pickupLabel, input.dropoffLabel);
  const lateNightFee = input.pickupDateTimeLocal && isLateNightPickup(input.pickupDateTimeLocal) ? 35 : 0;

  return {
    tripType: input.tripType,
    baseFare: rule.baseFare,
    perMileRate: rule.perMileRate,
    hourlyRate: rule.hourlyRate,
    minimumCharge: rule.minimumCharge,
    distanceMiles: input.distanceMiles,
    driveTimeMinutes: input.driveTimeMinutes,
    airportSurcharge: hasAirportSurcharge ? rule.airportSurcharge : 0,
    luggageCount: input.luggageCount ?? 0,
    luggageSurchargePerBag: rule.luggageSurchargePerBag,
    tolls: input.tolls ?? 0,
    lateNightFee,
  };
}
