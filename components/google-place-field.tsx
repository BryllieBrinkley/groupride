"use client"

import { Loader2, LocateFixed, MapPin } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { GooglePlaceSelection } from "@/lib/types"

type Prediction = google.maps.places.AutocompletePrediction

const CHARLOTTE_CENTER = { lat: 35.2271, lng: -80.8431 }
const DEFAULT_BOUNDS = {
  north: CHARLOTTE_CENTER.lat + 0.45,
  south: CHARLOTTE_CENTER.lat - 0.45,
  east: CHARLOTTE_CENTER.lng + 0.45,
  west: CHARLOTTE_CENTER.lng - 0.45,
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}

function getBoundsFromCenter(center: google.maps.LatLngLiteral, radiusDegrees = 0.35) {
  return {
    north: center.lat + radiusDegrees,
    south: center.lat - radiusDegrees,
    east: center.lng + radiusDegrees,
    west: center.lng - radiusDegrees,
  }
}

interface GooglePlaceFieldProps {
  id: string
  label: string
  placeholder: string
  value: string
  onValueChange: (value: string) => void
  onPlaceSelect: (place: GooglePlaceSelection | null) => void
  selectedPlace?: GooglePlaceSelection | null
  className?: string
  enableCurrentLocation?: boolean
}

export function GooglePlaceField({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  onPlaceSelect,
  selectedPlace,
  className,
  enableCurrentLocation = false,
}: GooglePlaceFieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const serviceContainerRef = useRef<HTMLDivElement | null>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const activeRequestId = useRef(0)

  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [locationBias, setLocationBias] = useState<google.maps.LatLngBoundsLiteral>(DEFAULT_BOUNDS)
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false)
  const [currentLocationError, setCurrentLocationError] = useState<string | null>(null)

  const debouncedValue = useDebouncedValue(value, 250)
  const isLoaded = typeof window !== "undefined" && !!window.google?.maps?.places

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationBias(
          getBoundsFromCenter(
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            0.3,
          ),
        )
      },
      () => {
        setLocationBias(DEFAULT_BOUNDS)
      },
      { enableHighAccuracy: false, timeout: 2500, maximumAge: 1000 * 60 * 30 },
    )
  }, [])

  useEffect(() => {
    if (!isLoaded || !serviceContainerRef.current) {
      return
    }

    autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
    placesServiceRef.current = new window.google.maps.places.PlacesService(serviceContainerRef.current)
  }, [isLoaded])

  useEffect(() => {
    if (!isLoaded || !autocompleteServiceRef.current) {
      return
    }

    const query = debouncedValue.trim()
    if (query.length < 2) {
      setPredictions([])
      setIsLoading(false)
      setActiveIndex(-1)
      return
    }

    const requestId = ++activeRequestId.current
    setIsLoading(true)

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: query,
        bounds: locationBias,
        componentRestrictions: { country: "us" },
        types: ["geocode", "establishment"],
      },
      (results, status) => {
        if (requestId !== activeRequestId.current) {
          return
        }

        setIsLoading(false)

        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results) {
          setPredictions([])
          setActiveIndex(-1)
          return
        }

        setPredictions(results)
        setIsOpen(true)
        setActiveIndex(results.length > 0 ? 0 : -1)
      },
    )
  }, [debouncedValue, isLoaded, locationBias])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const emptyStateLabel = useMemo(() => {
    if (!isLoaded) return "Google Maps is still loading."
    if (!debouncedValue.trim()) return "Search airports, hotels, venues, cities, landmarks, or addresses."
    return "No places found. Try another spelling or a nearby landmark."
  }, [debouncedValue, isLoaded])

  const handleSelectPrediction = (prediction: Prediction) => {
    if (!placesServiceRef.current || !window.google) {
      return
    }

    setIsLoading(true)
    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["formatted_address", "geometry", "name", "place_id"],
      },
      (place, status) => {
        setIsLoading(false)

        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !place?.geometry?.location ||
          !place.place_id
        ) {
          return
        }

        const selection: GooglePlaceSelection = {
          displayLabel: place.name ? `${place.name}${place.formatted_address ? `, ${place.formatted_address}` : ""}` : prediction.description,
          formattedAddress: place.formatted_address ?? prediction.description,
          placeId: place.place_id,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        }

        onValueChange(selection.displayLabel)
        onPlaceSelect(selection)
        setPredictions([])
        setIsOpen(false)
        setActiveIndex(-1)
      },
    )
  }

  const showDropdown = isOpen && (isLoading || predictions.length > 0 || Boolean(debouncedValue.trim()) || !isLoaded)

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setCurrentLocationError("Current location is not supported in this browser.")
      return
    }

    setIsUsingCurrentLocation(true)
    setCurrentLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
            const response = await fetch("/api/maps/reverse-geocode", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            })

            const payload = (await response.json()) as {
              formattedAddress?: string
              placeId?: string
              latitude?: number
              longitude?: number
              error?: string
            }

            if (!response.ok || !payload.formattedAddress) {
              throw new Error(payload.error ?? "Unable to reverse geocode current location.")
            }

            const selection: GooglePlaceSelection = {
              displayLabel: payload.formattedAddress,
              formattedAddress: payload.formattedAddress,
              placeId: payload.placeId ?? "",
              latitude: payload.latitude ?? position.coords.latitude,
              longitude: payload.longitude ?? position.coords.longitude,
            }

            onValueChange(selection.formattedAddress)
            onPlaceSelect(selection)
            setIsOpen(false)
            setPredictions([])
            setActiveIndex(-1)
          } catch (error) {
            setCurrentLocationError(
              error instanceof Error ? error.message : "We found your location, but couldn’t match it to an address.",
            )
          } finally {
            setIsUsingCurrentLocation(false)
          }
        })()
      },
      (error) => {
        setIsUsingCurrentLocation(false)
        if (error.code === error.PERMISSION_DENIED) {
          setCurrentLocationError("Location permission was denied.")
          return
        }
        setCurrentLocationError("Unable to get your current location right now.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 * 60 * 5 },
    )
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div ref={serviceContainerRef} className="hidden" aria-hidden />
      <Label htmlFor={id} className="mb-2 block text-black/45">
        {label}
      </Label>

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          autoComplete="off"
          onChange={(event) => {
            onValueChange(event.target.value)
            onPlaceSelect(null)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (!showDropdown || predictions.length === 0) {
              return
            }

            if (event.key === "ArrowDown") {
              event.preventDefault()
              setActiveIndex((current) => (current + 1) % predictions.length)
            }

            if (event.key === "ArrowUp") {
              event.preventDefault()
              setActiveIndex((current) => (current <= 0 ? predictions.length - 1 : current - 1))
            }

            if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault()
              void handleSelectPrediction(predictions[activeIndex])
            }

            if (event.key === "Escape") {
              setIsOpen(false)
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-black/10 bg-[#f7f4ef] px-4 py-4 pr-11 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black/30"
        />
        {isLoading ? (
          <Loader2 className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-black/35" />
        ) : null}
      </div>

      {selectedPlace ? (
        <p className="mt-2 text-xs leading-5 text-black/45">{selectedPlace.formattedAddress}</p>
      ) : null}

      {enableCurrentLocation ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isUsingCurrentLocation || !isLoaded}
            className="inline-flex items-center gap-2 rounded-full border border-[#e7dfd3] bg-[#f3efe8] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7a6f66] transition hover:border-[#d9c7b2] hover:text-[#2d211b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUsingCurrentLocation ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <LocateFixed className="size-3.5" />
            )}
            Use Current Location
          </button>

          {isUsingCurrentLocation ? <span className="text-xs text-black/40">Detecting location...</span> : null}
        </div>
      ) : null}

      {currentLocationError ? (
        <p className="mt-2 text-xs leading-5 text-[#8c5d50]">{currentLocationError}</p>
      ) : null}

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-30 overflow-hidden rounded-[28px] border border-[#e7dfd3] bg-[#f3efe8] shadow-[0_24px_60px_rgba(75,51,39,0.1)]">
          {predictions.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto p-2">
              {predictions.map((prediction, index) => (
                <li key={prediction.place_id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-3 rounded-[22px] px-4 py-3 text-left transition",
                      index === activeIndex ? "bg-[#ede5d9]" : "hover:bg-[#efe9df]",
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => void handleSelectPrediction(prediction)}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#e7dfd3] bg-[#f7f4ef] text-[#7a6f66]">
                      <MapPin className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[#2d211b]">
                        {prediction.structured_formatting.main_text}
                      </span>
                      <span className="mt-1 block truncate text-xs text-[#7a6f66]">
                        {prediction.structured_formatting.secondary_text ?? prediction.description}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-5 text-sm text-[#7a6f66]">
              {isLoading ? "Searching places..." : emptyStateLabel}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
