"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { FormField } from "@/components/shared/FormField"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { GooglePlaceSelection, LocationInput, TripRequestInput, VehicleCategory } from "@/lib/types"

function parseLocation(value: string): LocationInput {
  const parts = value.split(",").map((entry) => entry.trim()).filter(Boolean)
  return {
    addressLine: parts[0] ?? value,
    city: parts[1] ?? "Charlotte",
    state: (parts[2] ?? "NC").slice(0, 2).toUpperCase(),
  }
}

function parseStoredPlace(value: string | null): GooglePlaceSelection | null {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as GooglePlaceSelection
  } catch {
    return null
  }
}

function toLocationInput(place: GooglePlaceSelection | null, fallback: string): LocationInput {
  if (!place) {
    return parseLocation(fallback)
  }

  const addressParts = place.formattedAddress.split(",").map((entry) => entry.trim())
  const statePart = addressParts.at(-2)?.split(" ")[0] ?? "NC"

  return {
    addressLine: addressParts[0] ?? place.displayLabel,
    city: addressParts[1] ?? "Charlotte",
    state: statePart.slice(0, 2).toUpperCase(),
    postalCode: addressParts.at(-1)?.match(/\b\d{5}(?:-\d{4})?\b/)?.[0],
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const vehicle = searchParams.get("vehicle") || "minibus"
  const price = searchParams.get("price") || "$350"
  const pickup = searchParams.get("pickup") || ""
  const dropoff = searchParams.get("dropoff") || ""
  const pickupPlace = parseStoredPlace(searchParams.get("pickup_place"))
  const dropoffPlace = parseStoredPlace(searchParams.get("dropoff_place"))
  const passengers = searchParams.get("passengers") || ""
  const datetime = searchParams.get("datetime") || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  const distanceMiles = parseFloat(searchParams.get("distance") || "0")
  const driveTimeMinutes = parseInt(searchParams.get("duration") || "0")
  const routeText = searchParams.get("route_text") || `${pickup} to ${dropoff}`

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)

  const vehicleNames: Record<string, string> = {
    sprinter: "sprinter van",
    minibus: "mini bus",
    charter: "charter bus",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const payload: TripRequestInput = {
      tripType: "one_way",
      tripIntent: "other",
      pickupLocation: toLocationInput(pickupPlace, pickup || "Charlotte, NC"),
      dropoffLocation: toLocationInput(dropoffPlace, dropoff || "Charlotte, NC"),
      stops: [],
      pickupDateTimeLocal: datetime,
      passengers: Number(passengers || 1),
      luggageCount: 0,
      contactName: name,
      contactEmail: email,
      contactPhone: phone,
      selectedVehicleCategory: vehicle as VehicleCategory,
      paymentMethodToken: "pm_demo_saved",
      distanceMiles,
      driveTimeMinutes,
      formattedRouteText: routeText,
      pickupLat: pickupPlace?.latitude,
      pickupLng: pickupPlace?.longitude,
      dropoffLat: dropoffPlace?.latitude,
      dropoffLng: dropoffPlace?.longitude,
    }

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const result = (await response.json()) as { error?: string; booking?: { id: string } }
    if (!response.ok || !result.booking) {
      setError(result.error ?? "Unable to submit your booking.")
      return
    }

    router.push(`/quote/pending?bookingId=${result.booking.id}`)
  }

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="premium-panel p-7">
            <SectionEyebrow>Step 2 of 2</SectionEyebrow>
            <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em] text-foreground">
              Review your ride details.
            </h2>
            <div className="mt-8 flex items-start justify-between gap-6">
              <div>
                <h3 className="text-2xl font-medium text-foreground">
                  {vehicleNames[vehicle] || vehicle}
                </h3>
                {pickup && dropoff && (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {pickup} to {dropoff}
                  </p>
                )}
                {passengers && (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {passengers} passengers
                  </p>
                )}
                {distanceMiles > 0 || driveTimeMinutes > 0 ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {distanceMiles.toFixed(1)} miles • {driveTimeMinutes} min drive
                  </p>
                ) : null}
              </div>
              <p className="text-3xl font-medium tracking-[-0.04em] text-foreground">
                {price}
              </p>
            </div>
            <div className="mt-10 space-y-3 text-sm text-muted-foreground">
              <p className="rounded-2xl border border-border bg-background px-4 py-3">
                No charge until your booking is confirmed.
              </p>
              <p className="rounded-2xl border border-border bg-background px-4 py-3">
                A GroupRide specialist will confirm final logistics and operator fit.
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="premium-panel space-y-5 p-7">
            <SectionEyebrow>Contact details</SectionEyebrow>
            <h1 className="text-3xl font-medium tracking-[-0.04em] text-foreground">
              Send your request.
            </h1>
            <FormField label="Name" htmlFor="name">
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </FormField>
            <FormField label="Phone" htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </FormField>
            <Button type="submit" size="lg" className="group mt-4 w-full">
              confirm request
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            {error ? <p className="text-sm text-[#8c5d50]">{error}</p> : null}
          </form>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CheckoutContent />
    </Suspense>
  )
}
