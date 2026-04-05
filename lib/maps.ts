// Centralized Google Maps logic for GroupRide
import { env } from "@/lib/env";

export function getGoogleMapsApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || env.googleMapsApiKey;
  if (!key || key.trim() === "") {
    throw new Error("Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.");
  }
  return key;
}

export function getGoogleMapsScriptUrl(): string {
  const apiKey = getGoogleMapsApiKey();
  const params = new URLSearchParams({
    key: apiKey,
    libraries: "places,routes",
    v: "weekly",
    region: "US",
    language: "en",
  });
  return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
}

// Singleton loader for Google Maps JS API
let googleMapsScriptPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google && window.google.maps && window.google.maps.places) return Promise.resolve();
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-google-maps]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps script.")));
      return;
    }
    const script = document.createElement("script");
    script.src = getGoogleMapsScriptUrl();
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script."));
    document.head.appendChild(script);
  });
  return googleMapsScriptPromise;
}
