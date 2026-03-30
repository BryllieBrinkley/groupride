import type { LocationInput, ResolvedLocation } from "@/lib/types";

const CITY_LOOKUP: Record<string, { latitude: number; longitude: number; timezone: string }> = {
  "charlotte_nc": { latitude: 35.2271, longitude: -80.8431, timezone: "America/New_York" },
  "raleigh_nc": { latitude: 35.7796, longitude: -78.6382, timezone: "America/New_York" },
  "atlanta_ga": { latitude: 33.749, longitude: -84.388, timezone: "America/New_York" },
  "nashville_tn": { latitude: 36.1627, longitude: -86.7816, timezone: "America/Chicago" },
  "miami_fl": { latitude: 25.7617, longitude: -80.1918, timezone: "America/New_York" },
  "chicago_il": { latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago" },
  "houston_tx": { latitude: 29.7604, longitude: -95.3698, timezone: "America/Chicago" },
  "dallas_tx": { latitude: 32.7767, longitude: -96.797, timezone: "America/Chicago" },
  "phoenix_az": { latitude: 33.4484, longitude: -112.074, timezone: "America/Phoenix" },
  "denver_co": { latitude: 39.7392, longitude: -104.9903, timezone: "America/Denver" },
  "los-angeles_ca": { latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  "san-francisco_ca": { latitude: 37.7749, longitude: -122.4194, timezone: "America/Los_Angeles" },
  "seattle_wa": { latitude: 47.6062, longitude: -122.3321, timezone: "America/Los_Angeles" },
  "washington_dc": { latitude: 38.9072, longitude: -77.0369, timezone: "America/New_York" },
  "new-york_ny": { latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
  "orlando_fl": { latitude: 28.5383, longitude: -81.3792, timezone: "America/New_York" },
  "charleston_sc": { latitude: 32.7765, longitude: -79.9311, timezone: "America/New_York" }
};

const STATE_TIMEZONES: Record<string, string> = {
  AL: "America/Chicago",
  AK: "America/Anchorage",
  AZ: "America/Phoenix",
  AR: "America/Chicago",
  CA: "America/Los_Angeles",
  CO: "America/Denver",
  CT: "America/New_York",
  DC: "America/New_York",
  DE: "America/New_York",
  FL: "America/New_York",
  GA: "America/New_York",
  HI: "Pacific/Honolulu",
  IA: "America/Chicago",
  ID: "America/Denver",
  IL: "America/Chicago",
  IN: "America/New_York",
  KS: "America/Chicago",
  KY: "America/New_York",
  LA: "America/Chicago",
  MA: "America/New_York",
  MD: "America/New_York",
  ME: "America/New_York",
  MI: "America/New_York",
  MN: "America/Chicago",
  MO: "America/Chicago",
  MS: "America/Chicago",
  MT: "America/Denver",
  NC: "America/New_York",
  ND: "America/Chicago",
  NE: "America/Chicago",
  NH: "America/New_York",
  NJ: "America/New_York",
  NM: "America/Denver",
  NV: "America/Los_Angeles",
  NY: "America/New_York",
  OH: "America/New_York",
  OK: "America/Chicago",
  OR: "America/Los_Angeles",
  PA: "America/New_York",
  RI: "America/New_York",
  SC: "America/New_York",
  SD: "America/Chicago",
  TN: "America/Chicago",
  TX: "America/Chicago",
  UT: "America/Denver",
  VA: "America/New_York",
  VT: "America/New_York",
  WA: "America/Los_Angeles",
  WI: "America/Chicago",
  WV: "America/New_York",
  WY: "America/Denver"
};

function normalizeKey(city: string, state: string) {
  return `${city.trim().toLowerCase().replace(/\s+/g, "-")}_${state.trim().toLowerCase()}`;
}

function pseudoCoordinate(seed: string, min: number, max: number) {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const normalized = hash / 0xffffffff;
  return min + (max - min) * normalized;
}

export function resolveFallbackLocation(input: LocationInput): ResolvedLocation {
  const key = normalizeKey(input.city, input.state);
  const known = CITY_LOOKUP[key];
  const latitude = known?.latitude ?? pseudoCoordinate(`${key}_lat`, 25, 48);
  const longitude = known?.longitude ?? pseudoCoordinate(`${key}_lng`, -123, -71);
  const timezone = known?.timezone ?? STATE_TIMEZONES[input.state.toUpperCase()] ?? "America/New_York";

  return {
    ...input,
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    label: `${input.addressLine}, ${input.city}, ${input.state.toUpperCase()}`,
    latitude,
    longitude,
    timezone
  };
}

export function haversineMiles(a: ResolvedLocation, b: ResolvedLocation) {
  const R = 3958.8;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
