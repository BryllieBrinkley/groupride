"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"

import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { SectionCard } from "@/components/shared/SectionCard"
import { FormField } from "@/components/shared/FormField"
import { TripSummaryCard } from "@/components/shared/TripSummaryCard"
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

  const vehicleParam = searchParams.get("vehicle") || "minibus"
  const priceParam = searchParams.get("price") || "350"
  const pickup = searchParams.get("pickup") || ""
  const dropoff = searchParams.get("dropoff") || ""
  const pickupPlace = parseStoredPlace(searchParams.get("pickup_place"))
  const dropoffPlace = parseStoredPlace(searchParams.get("dropoff_place"))
  const passengers = Number.parseInt(searchParams.get("passengers") || "1", 10)
  const datetime = searchParams.get("datetime") || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  const distanceMiles = Number.parseFloat(searchParams.get("distance") || "0")
  const driveTimeMinutes = Number.parseInt(searchParams.get("duration") || "0", 10)
  const routeText = searchParams.get("route_text") || [pickup, dropoff].filter(Boolean).join(" to ") || "your route"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const vehicleCategory = useMemo<VehicleCategory>(() => {
    if (vehicleParam === "charter" || vehicleParam === "charter_bus") return "charter_bus"
    if (vehicleParam === "sprinter") return "sprinter"
    return "minibus"
  }, [vehicleParam])

  const vehicleNames: Record<VehicleCategory, string> = {
    sprinter: "sprinter van",
    minibus: "mini bus",
    charter_bus: "charter bus",
    suv: "executive suv",
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const payload: TripRequestInput = {
      tripType: "one_way",
      tripIntent: "other",
      pickupLocation: toLocationInput(pickupPlace, pickup || "Charlotte, NC"),
      dropoffLocation: toLocationInput(dropoffPlace, dropoff || "Charlotte, NC"),
      stops: [],
      pickupDateTimeLocal: datetime,
      passengers: Number.isFinite(passengers) && passengers > 0 ? passengers : 1,
      luggageCount: 0,
      contactName: name,
      contactEmail: email,
      contactPhone: phone,
      selectedVehicleCategory: vehicleCategory,
      // Demo placeholder: production checkout should pass a real payment method token.
      paymentMethodToken: "pm_demo_saved",
      distanceMiles: Number.isFinite(distanceMiles) ? distanceMiles : 0,
      driveTimeMinutes: Number.isFinite(driveTimeMinutes) ? driveTimeMinutes : 0,
      formattedRouteText: routeText,
      pickupLat: pickupPlace?.latitude,
      pickupLng: pickupPlace?.longitude,
      dropoffLat: dropoffPlace?.latitude,
      dropoffLng: dropoffPlace?.longitude,
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as { error?: string; booking?: { id: string; reference?: string } }
      if (!response.ok || !result.booking) {
        throw new Error(result.error ?? "Unable to submit your booking.")
      }

      router.push(`/quote/pending?bookingId=${result.booking.id}`)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to submit your booking.")
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <TripSummaryCard
              eyebrow="Step 2 of 2"
              title={vehicleNames[vehicleCategory]}
              route={routeText}
              dateTime={datetime || "Pickup time to be confirmed"}
              passengers={passengers}
              vehicle={vehicleCategory}
              amount={Number.parseFloat(priceParam || "0")}
              details={[
                { label: "Distance", value: distanceMiles > 0 ? `${distanceMiles.toFixed(1)} miles` : "Pending route estimate" },
                { label: "Drive time", value: driveTimeMinutes > 0 ? `${driveTimeMinutes} min` : "Pending route estimate" },
              ]}
            />

            <SectionCard
              eyebrow="Booking policy"
              title="Review before dispatch"
              description="A GroupRide specialist will confirm final logistics and operator fit before the trip is locked in."
            >
              <div className="space-y-3">
                <p className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  No charge until your booking is confirmed.
                </p>
                <Button variant="outline" onClick={() => router.push(`/quote?${searchParams.toString()}`)}>
                  Back to vehicle options
                </Button>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            eyebrow="Contact details"
            title="Send your request."
            description="We’ll use these details to confirm the fit and reach out if anything needs clarification."
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label="Name" htmlFor="name">
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </FormField>
              <FormField label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                />
              </FormField>
              <FormField label="Phone" htmlFor="phone">
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone number"
                />
              </FormField>
              <Button type="submit" size="lg" className="group mt-4 w-full" disabled={isSubmitting}>
                {isSubmitting ? "submitting request" : "confirm request"}
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </Button>
              {error ? <p className="text-sm text-[#8c5d50]">{error}</p> : null}
            </form>
          </SectionCard>
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
