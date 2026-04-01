"use client";

import { useEffect, useRef, useState } from "react";

import { getFallbackRouteMetrics } from "@/lib/adapters/maps";
import type { GooglePlaceSelection, RouteMetrics } from "@/lib/types";

export function useRouteMetrics({
  pickup,
  dropoff,
}: {
  pickup: GooglePlaceSelection | null;
  dropoff: GooglePlaceSelection | null;
}) {
  const [metrics, setMetrics] = useState<RouteMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!pickup || !dropoff || !window.google?.maps?.DistanceMatrixService) {
      setMetrics(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    const service = new window.google.maps.DistanceMatrixService();
    setIsLoading(true);
    setError(null);

    service.getDistanceMatrix(
      {
        origins: [new window.google.maps.LatLng(pickup.latitude, pickup.longitude)],
        destinations: [new window.google.maps.LatLng(dropoff.latitude, dropoff.longitude)],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
        drivingOptions: {
          departureTime: new Date(),
        },
      },
      (response, status) => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        if (
          status !== "OK" ||
          !response?.rows?.[0]?.elements?.[0] ||
          response.rows[0].elements[0].status !== "OK"
        ) {
          try {
            setMetrics(getFallbackRouteMetrics({ pickup, dropoff }));
            setError("Live route data is unavailable right now. Showing an estimate instead.");
          } catch {
            setMetrics(null);
            setError("Unable to calculate route details right now.");
          }
          setIsLoading(false);
          return;
        }

        const element = response.rows[0].elements[0];
        const distanceMiles = Number((((element.distance?.value ?? 0) / 1609.34)).toFixed(1));
        const driveTimeMinutes = Math.max(1, Math.round((element.duration?.value ?? 0) / 60));

        setMetrics({
          distanceMiles,
          driveTimeMinutes,
          formattedRouteText: `${pickup.displayLabel} to ${dropoff.displayLabel}`,
          pickupLat: pickup.latitude,
          pickupLng: pickup.longitude,
          dropoffLat: dropoff.latitude,
          dropoffLng: dropoff.longitude,
        });
        setIsLoading(false);
      },
    );
  }, [pickup, dropoff]);

  return { metrics, isLoading, error };
}
