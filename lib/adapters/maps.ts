import { env } from "@/lib/env";
import { haversineMiles, resolveFallbackLocation } from "@/lib/geo";
import type { LocationInput, RouteEstimate } from "@/lib/types";
import { makeId } from "@/lib/utils";

async function geocodeAddress(input: LocationInput) {
  const encoded = encodeURIComponent(`${input.addressLine}, ${input.city}, ${input.state} ${input.postalCode ?? ""}`);
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${env.googleMapsApiKey}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Google geocoding failed");
  }

  const payload = (await response.json()) as {
    results?: Array<{
      geometry: { location: { lat: number; lng: number } };
      formatted_address: string;
    }>;
  };

  const result = payload.results?.[0];
  if (!result) {
    throw new Error("No geocode result");
  }

  const fallback = resolveFallbackLocation(input);

  return {
    ...fallback,
    label: result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng
  };
}

async function getGoogleRouteEstimate(input: {
  pickupLocation: LocationInput;
  dropoffLocation: LocationInput;
  stops: LocationInput[];
}): Promise<RouteEstimate> {
  const pickup = await geocodeAddress(input.pickupLocation);
  const dropoff = await geocodeAddress(input.dropoffLocation);
  const stops = await Promise.all(
    input.stops.map(async (stop, index) => ({
      id: makeId("stop"),
      order: index + 1,
      location: await geocodeAddress(stop)
    }))
  );

  const waypointParam =
    stops.length > 0
      ? `&waypoints=${encodeURIComponent(stops.map((stop) => stop.location.label).join("|"))}`
      : "";

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      pickup.label
    )}&destination=${encodeURIComponent(dropoff.label)}${waypointParam}&key=${env.googleMapsApiKey}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Google directions failed");
  }

  const payload = (await response.json()) as {
    routes?: Array<{
      legs?: Array<{
        distance?: { value: number };
        duration?: { value: number };
      }>;
    }>;
  };

  const legs = payload.routes?.[0]?.legs ?? [];
  const distanceMeters = legs.reduce((sum, leg) => sum + (leg.distance?.value ?? 0), 0);
  const durationSeconds = legs.reduce((sum, leg) => sum + (leg.duration?.value ?? 0), 0);

  return {
    pickup,
    dropoff,
    stops,
    distanceMiles: Number((distanceMeters / 1609.34).toFixed(1)),
    estimatedDurationMinutes: Math.max(15, Math.round(durationSeconds / 60))
  };
}

function getFallbackRouteEstimate(input: {
  pickupLocation: LocationInput;
  dropoffLocation: LocationInput;
  stops: LocationInput[];
}): RouteEstimate {
  const pickup = resolveFallbackLocation(input.pickupLocation);
  const dropoff = resolveFallbackLocation(input.dropoffLocation);
  const stops = input.stops.map((stop, index) => ({
    id: makeId("stop"),
    order: index + 1,
    location: resolveFallbackLocation(stop)
  }));

  const points = [pickup, ...stops.map((stop) => stop.location), dropoff];
  let totalMiles = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    totalMiles += haversineMiles(points[index], points[index + 1]) * 1.18;
  }

  return {
    pickup,
    dropoff,
    stops,
    distanceMiles: Number(totalMiles.toFixed(1)),
    estimatedDurationMinutes: Math.max(20, Math.round(totalMiles * 2.1))
  };
}

export async function getRouteEstimate(input: {
  pickupLocation: LocationInput;
  dropoffLocation: LocationInput;
  stops: LocationInput[];
}) {
  if (env.googleMapsApiKey && !env.demoMode) {
    try {
      return await getGoogleRouteEstimate(input);
    } catch {
      return getFallbackRouteEstimate(input);
    }
  }

  return getFallbackRouteEstimate(input);
}
