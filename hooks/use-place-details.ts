import { useState } from "react";

export interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  name: string;
  types: string[];
}

export function usePlaceDetails(placeId: string | null): {
  details: PlaceDetails | null;
  loading: boolean;
  error?: string;
} {
  const [details] = useState<PlaceDetails | null>(null);
  void placeId;
  return { details, loading: false, error: undefined };
}
