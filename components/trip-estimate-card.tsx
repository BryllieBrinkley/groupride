import React, { useState, useEffect, useMemo, useCallback } from "react";
// If framer-motion or lodash-es are not installed, comment these out or provide fallback
// import { motion, AnimatePresence } from "framer-motion";
// import { debounce } from "lodash-es";
const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const motion = { div: (props: any) => <div {...props} /> };
function debounce<T extends (...args: any[]) => any>(fn: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
import { calculateQuoteBreakdown, buildQuotePricingInput, QUOTE_RULES } from "@/lib/services/quote-calculator";
import type { TripType, VehicleCategory, QuotePricingBreakdown } from "@/lib/types";
import { getRouteEstimate } from "@/lib/adapters/maps";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export interface TripEstimateInput {
  pickup: string;
  dropoff: string;
  pickupPlaceId?: string;
  dropoffPlaceId?: string;
  passengers: number;
  vehicleCategory?: VehicleCategory;
  tripType: TripType;
  dateTimeLocal: string;
  luggageCount: number;
  returnTrip: boolean;
}

export interface TripEstimateCardProps {
  input: TripEstimateInput;
  onVehicleChange?: (vehicle: VehicleCategory) => void;
  onReady?: (ready: boolean) => void;
  disabled?: boolean;
}

const VEHICLE_RECOMMENDATIONS = [
  { min: 1, max: 5, category: "suv" },
  { min: 6, max: 14, category: "sprinter" },
  { min: 15, max: 32, category: "minibus" },
  { min: 33, max: 99, category: "charter_bus" },
] as const;

function recommendVehicle(passengers: number): VehicleCategory {
  const found = VEHICLE_RECOMMENDATIONS.find(
    (v) => passengers >= v.min && passengers <= v.max
  );
  return (found?.category ?? "suv") as VehicleCategory;
}

export const TripEstimateCard: React.FC<TripEstimateCardProps> = ({
  input,
  onVehicleChange,
  onReady,
  disabled,
}) => {
  const [route, setRoute] = useState<{
    distanceMiles: number;
    estimatedDurationMinutes: number;
    loading: boolean;
    error?: string;
  }>({ distanceMiles: 0, estimatedDurationMinutes: 0, loading: false });
  const [pricing, setPricing] = useState<QuotePricingBreakdown | null>(null);
  const [animating, setAnimating] = useState(false);

  // Debounced route calculation
  const fetchRoute = useMemo(
    () =>
      debounce(async (pickup: string, dropoff: string) => {
        setRoute((r) => ({ ...r, loading: true, error: undefined }));
        try {
          const result = await getRouteEstimate({
            pickupLocation: { addressLine: pickup, city: "", state: "" },
            dropoffLocation: { addressLine: dropoff, city: "", state: "" },
            stops: [],
          });
          setRoute({
            distanceMiles: result.distanceMiles,
            estimatedDurationMinutes: result.estimatedDurationMinutes,
            loading: false,
          });
        } catch (e) {
          setRoute({ distanceMiles: 0, estimatedDurationMinutes: 0, loading: false, error: "Could not calculate route." });
        }
      }, 600),
    []
  );

  // Watch for pickup/dropoff changes
  useEffect(() => {
    if (input.pickup && input.dropoff) {
      fetchRoute(input.pickup, input.dropoff);
    }
  }, [input.pickup, input.dropoff, fetchRoute]);

  // Memoize pricing calculation
  const vehicleCategory = input.vehicleCategory || recommendVehicle(input.passengers);
  const pricingInput = useMemo(() => {
    return buildQuotePricingInput({
      vehicleCategory,
      tripType: input.tripType,
      distanceMiles: route.distanceMiles,
      driveTimeMinutes: route.estimatedDurationMinutes,
      routeText: `${input.pickup} to ${input.dropoff}`,
      pickupLabel: input.pickup,
      dropoffLabel: input.dropoff,
      luggageCount: input.luggageCount,
      pickupDateTimeLocal: input.dateTimeLocal,
    });
  }, [vehicleCategory, input, route.distanceMiles, route.estimatedDurationMinutes]);

  useEffect(() => {
    setAnimating(true);
    setPricing(calculateQuoteBreakdown(pricingInput));
    const timeout = setTimeout(() => setAnimating(false), 400);
    return () => clearTimeout(timeout);
  }, [pricingInput]);

  // Notify parent when ready
  useEffect(() => {
    if (onReady) {
      const ready =
        !route.loading &&
        !!pricing &&
        Boolean(input.pickup) &&
        Boolean(input.dropoff) &&
        input.passengers > 0;
      onReady(ready);
    }
  }, [route.loading, pricing, input, onReady]);

  // Vehicle change handler
  useEffect(() => {
    if (onVehicleChange) {
      onVehicleChange(vehicleCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleCategory]);

  // UI
  return (
    <aside className="sticky top-24 z-20 w-full max-w-md mx-auto md:mx-0 premium-panel animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Trip Estimate</h2>
        {route.loading && <span className="text-xs text-muted-foreground">calculating estimate...</span>}
      </div>
      <div className="space-y-4">
        {/* Trip Summary */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Trip Summary</div>
          <div className="flex flex-wrap gap-2 text-base text-foreground">
            <span>{input.pickup || <Skeleton className="w-16 h-4" />}</span>
            <span>→</span>
            <span>{input.dropoff || <Skeleton className="w-16 h-4" />}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {input.passengers > 0 ? `${input.passengers} passengers` : <Skeleton className="w-10 h-3" />} • {route.distanceMiles ? `${route.distanceMiles.toFixed(1)} mi` : <Skeleton className="w-8 h-3" />} • {route.estimatedDurationMinutes ? `${route.estimatedDurationMinutes} min` : <Skeleton className="w-8 h-3" />}
          </div>
        </div>
        {/* Vehicle Recommendation */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Vehicle Recommendation</div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground capitalize">{vehicleCategory.replace("_", " ")}</span>
            <span className="text-xs text-muted-foreground">({QUOTE_RULES[vehicleCategory].baseFare > 0 ? `from $${QUOTE_RULES[vehicleCategory].baseFare}` : ""})</span>
          </div>
        </div>
        {/* Estimated Pricing */}
        <div>
          <div className="text-sm text-muted-foreground mb-1">Estimated Pricing</div>
          <AnimatePresence>
            {pricing ? (
              <motion.div
                key={pricing.total}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-bold text-[#7c4a1e]"
              >
                ${pricing.total.toLocaleString()}
              </motion.div>
            ) : (
              <Skeleton className="w-24 h-8" />
            )}
          </AnimatePresence>
        </div>
        {/* Additional Fees */}
        <div className="text-xs text-muted-foreground">
          <div>Base fare: ${pricing?.baseFare ?? <Skeleton className="w-8 h-3 inline-block" />}</div>
          <div>Mileage: ${pricing?.mileageCharge ?? <Skeleton className="w-8 h-3 inline-block" />}</div>
          <div>Hourly: ${pricing?.hourlyCharge ?? <Skeleton className="w-8 h-3 inline-block" />}</div>
          <div>Airport: ${pricing?.airportSurcharge ?? <Skeleton className="w-8 h-3 inline-block" />}</div>
          <div>Luggage: ${pricing?.luggageSurcharge ?? <Skeleton className="w-8 h-3 inline-block" />}</div>
          <div>Late night: ${pricing?.lateNightFee ?? <Skeleton className="w-8 h-3 inline-block" />}</div>
          <div>Tolls: ${pricing?.tolls ?? <Skeleton className="w-8 h-3 inline-block" />}</div>
          {pricing?.minimumApplied && <div className="text-[#a67c52]">Minimum fare applied</div>}
        </div>
        {/* Final Estimated Total */}
        <div className="text-base font-medium text-foreground mt-2">
          Final Estimate: {pricing ? `$${pricing.total.toLocaleString()}` : <Skeleton className="w-16 h-5 inline-block" />}
        </div>
        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground mt-2">
          Final quote confirmed after operator match. Pricing may vary based on availability, route, and trip details.
        </div>
      </div>
      <Button className="mt-6 w-full" disabled={disabled || !pricing || route.loading || !input.pickup || !input.dropoff || !input.passengers}>
        Continue to Checkout
      </Button>
    </aside>
  );
};
