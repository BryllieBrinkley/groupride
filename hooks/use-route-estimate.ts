import { useEffect, useState } from "react";
import { useGoogleMaps } from "@/hooks/use-google-maps";

export interface RouteEstimate {
  distanceMiles: number;
  durationMinutes: number;
  summary: string;
}

export function useRouteEstimate(pickup: { lat: number; lng: number } | null, dropoff: { lat: number; lng: number } | null): {
  estimate: RouteEstimate | null;
  loading: boolean;
  error?: string;
} {
  const loaded = useGoogleMaps();
  const [estimate, setEstimate] = useState<RouteEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!loaded || !pickup || !dropoff) {
      setEstimate(null);
      setLoading(false);
      setError(undefined);
      return;
    }
    if (!window.google?.maps?.DistanceMatrixService) {
      setEstimate(null);
      setError("Route tools are unavailable right now.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [new window.google.maps.LatLng(pickup.lat, pickup.lng)],
        destinations: [new window.google.maps.LatLng(dropoff.lat, dropoff.lng)],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
        drivingOptions: {
          departureTime: new Date(),
        },
      },
      (response, status) => {
        const element = response?.rows?.[0]?.elements?.[0];
        if (status !== "OK" || !element || element.status !== "OK") {
          setEstimate(null);
          setError("No route found.");
          setLoading(false);
          return;
        }

        setEstimate({
          distanceMiles: Number((((element.distance?.value ?? 0) / 1609.34)).toFixed(1)),
          durationMinutes: Math.max(1, Math.round((element.duration?.value ?? 0) / 60)),
          summary: "Route calculated",
        });
        setError(undefined);
        setLoading(false);
      },
    );
  }, [loaded, pickup, dropoff]);

  return { estimate, loading, error };
}
