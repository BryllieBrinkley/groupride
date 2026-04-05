import { env } from "@/lib/env";
import { haversineMiles, resolveFallbackLocation } from "@/lib/geo";
import type { GooglePlaceSelection, LocationInput, RouteEstimate, RouteMetrics } from "@/lib/types";
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
      pickup.label,
    )}&destination=${encodeURIComponent(dropoff.label)}${waypointParam}&key=${env.googleMapsApiKey}`,
    { cache: "no-store" },
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
    estimatedDurationMinutes: Math.max(15, Math.round(durationSeconds / 60)),
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

export async function reverseGeocodeCoordinates(input: { latitude: number; longitude: number }) {
  if (!env.googleMapsApiKey || env.demoMode) {
    return {
      formattedAddress: `Current location near ${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)}`,
      placeId: "",
      latitude: input.latitude,
      longitude: input.longitude,
    };
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${input.latitude},${input.longitude}&key=${env.googleMapsApiKey}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const payload = (await response.json()) as {
    results?: Array<{
      formatted_address: string;
      place_id?: string;
      geometry?: { location?: { lat: number; lng: number } };
    }>;
  };

  const result = payload.results?.[0];
  if (!result?.formatted_address) {
    throw new Error("No reverse geocode result");
  }

  return {
    formattedAddress: result.formatted_address,
    placeId: result.place_id ?? "",
    latitude: result.geometry?.location?.lat ?? input.latitude,
    longitude: result.geometry?.location?.lng ?? input.longitude,
  };
}

export function getFallbackRouteMetrics(input: {
  pickup: GooglePlaceSelection;
  dropoff: GooglePlaceSelection;
}): RouteMetrics {
  const pickup = resolveFallbackLocation({
    addressLine: input.pickup.formattedAddress,
    city: input.pickup.formattedAddress.split(",")[1]?.trim() ?? "Charlotte",
    state: input.pickup.formattedAddress.split(",")[2]?.trim().slice(0, 2).toUpperCase() ?? "NC",
  });
  pickup.latitude = input.pickup.latitude;
  pickup.longitude = input.pickup.longitude;

  const dropoff = resolveFallbackLocation({
    addressLine: input.dropoff.formattedAddress,
    city: input.dropoff.formattedAddress.split(",")[1]?.trim() ?? "Charlotte",
    state: input.dropoff.formattedAddress.split(",")[2]?.trim().slice(0, 2).toUpperCase() ?? "NC",
  });
  dropoff.latitude = input.dropoff.latitude;
  dropoff.longitude = input.dropoff.longitude;

  const distanceMiles = Number((haversineMiles(pickup, dropoff) * 1.18).toFixed(1));
  const driveTimeMinutes = Math.max(10, Math.round(distanceMiles * 2.1));

  return {
    distanceMiles,
    driveTimeMinutes,
    formattedRouteText: `${input.pickup.displayLabel} to ${input.dropoff.displayLabel}`,
    pickupLat: input.pickup.latitude,
    pickupLng: input.pickup.longitude,
    dropoffLat: input.dropoff.latitude,
    dropoffLng: input.dropoff.longitude,
  };
}
