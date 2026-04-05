import { useState } from "react";

export interface PlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  formattedAddress: string;
  types: string[];
}

export function usePlaceAutocomplete(query: string, options?: {
  locationBias?: { lat: number; lng: number; radiusMeters: number };
  sessionToken?: any;
  debounceMs?: number;
  region?: string;
  country?: string;
}): {
  suggestions: PlaceSuggestion[];
  loading: boolean;
  error?: string;
  sessionToken: any;
  refresh: () => void;
} {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  void query;
  void options;

  return {
    suggestions,
    loading: false,
    error: undefined,
    sessionToken: null,
    refresh: () => setSuggestions([]),
  };
}
