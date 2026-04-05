"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight } from "lucide-react"

import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { SectionCard } from "@/components/shared/SectionCard"
import { TripSummaryCard } from "@/components/shared/TripSummaryCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/shared/FormField"
import { buildQuotePricingInput, calculateQuoteBreakdown } from "@/lib/services/quote-calculator"
import type { VehicleCategory } from "@/lib/types"

interface VehicleOption {
  id: VehicleCategory | "custom"
  name: string
  description: string
  price: string
  isBestFit?: boolean
  isCustom?: boolean
  features: string[]
}

interface StandardVehicleOption extends Omit<VehicleOption, "id"> {
  id: VehicleCategory
}

function QuoteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const pickupPlace = searchParams.get("pickup_place") || ""
  const dropoffPlace = searchParams.get("dropoff_place") || ""
  const initialPickup = searchParams.get("pickup") || ""
  const initialDropoff = searchParams.get("dropoff") || ""
  const initialPassengers = Number.parseInt(searchParams.get("passengers") || "12", 10)
  const initialDistance = Number.parseFloat(searchParams.get("distance") || "18")
  const initialDuration = Number.parseInt(searchParams.get("duration") || "35", 10)
  const initialDateTime =
    searchParams.get("datetime") || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)

  // Demo note: these inputs are intentionally local and lightweight for v1 client demos.
  const [pickup, setPickup] = useState(initialPickup)
  const [dropoff, setDropoff] = useState(initialDropoff)
  const [passengersInput, setPassengersInput] = useState(String(initialPassengers))
  const [distanceInput, setDistanceInput] = useState(String(initialDistance))
  const [durationInput, setDurationInput] = useState(String(initialDuration))
  const [datetime, setDatetime] = useState(initialDateTime)

  const passengers = Math.max(1, Number.parseInt(passengersInput || "1", 10) || 1)
  const distance = Math.max(0, Number.parseFloat(distanceInput || "0") || 0)
  const duration = Math.max(0, Number.parseInt(durationInput || "0", 10) || 0)
  const routeText = useMemo(
    () => [pickup, dropoff].filter(Boolean).join(" to ") || "your route",
    [pickup, dropoff],
  )

  const isLongDistance = distance > 250 || duration > 240

  const baseVehicles: StandardVehicleOption[] = [
    {
      id: "sprinter",
      name: "sprinter van",
      description: "seats 10-15, ideal for smaller premium groups",
      price: "",
      isBestFit: passengers <= 14,
      features: ["comfortable seating", "luggage space", "flexible event routing"],
    },
    {
      id: "minibus",
      name: "mini bus",
      description: "seats 20-35, more room for events and airport moves",
      price: "",
      isBestFit: passengers >= 15 && passengers <= 35,
      features: ["extra legroom", "group-friendly boarding", "best for medium groups"],
    },
    {
      id: "charter_bus",
      name: "charter bus",
      description: "seats 36-56, full-size capacity for larger groups",
      price: "",
      isBestFit: passengers > 35,
      features: ["high-capacity seating", "long-haul comfort", "best for large groups"],
    },
  ]

  const vehicles: VehicleOption[] = baseVehicles.map((vehicle) => {
    const breakdown = calculateQuoteBreakdown(
      buildQuotePricingInput({
        vehicleCategory: vehicle.id,
        tripType: "one_way",
        distanceMiles: Number.isFinite(distance) ? distance : 0,
        driveTimeMinutes: Number.isFinite(duration) ? duration : 0,
        routeText,
        pickupLabel: pickup,
        dropoffLabel: dropoff,
        pickupDateTimeLocal: datetime,
      }),
    )

    return {
      ...vehicle,
      price: `$${breakdown.total.toFixed(0)}`,
    }
  })

  if (isLongDistance) {
    vehicles.push({
      id: "custom",
      name: "custom itinerary",
      description: "manual review for long-distance trips, multi-city routing, or premium transport planning",
      price: "request quote",
      isCustom: true,
      features: ["manual review", "best for long-distance trips", "custom itinerary support"],
    })
  }

  const handleSelect = (vehicle: VehicleOption) => {
    if (vehicle.isCustom) {
      router.push("/quote/request")
      return
    }

    const params = new URLSearchParams({
      vehicle: vehicle.id,
      price: vehicle.price.replace("$", ""),
      pickup,
      dropoff,
      passengers: passengers.toString(),
      datetime,
      distance: distance.toString(),
      duration: duration.toString(),
      route_text: routeText,
    })

    if (pickupPlace) {
      params.set("pickup_place", pickupPlace)
    }

    if (dropoffPlace) {
      params.set("dropoff_place", dropoffPlace)
    }

    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 max-w-3xl">
            <SectionEyebrow>Step 1 of 2</SectionEyebrow>
            <h1 className="mt-5 text-4xl font-medium tracking-[-0.05em] text-foreground sm:text-5xl">
              Select the right ride for your group.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {passengers} passengers
              {pickup && dropoff ? ` • ${pickup} to ${dropoff}` : ""}
            </p>
            {distance > 0 || duration > 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {distance.toFixed(1)} miles • {duration} min drive
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Route details will still carry into checkout even if live distance is unavailable.
              </p>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <SectionCard
              eyebrow="Vehicle options"
              title="Choose the best fit for this group"
              description="Pricing and vehicle recommendations follow the route details passed from the homepage quote form."
            >
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <FormField label="Pickup" htmlFor="quote-pickup">
                  <Input id="quote-pickup" value={pickup} onChange={(event) => setPickup(event.target.value)} placeholder="Airport, hotel, or address" />
                </FormField>
                <FormField label="Dropoff" htmlFor="quote-dropoff">
                  <Input id="quote-dropoff" value={dropoff} onChange={(event) => setDropoff(event.target.value)} placeholder="Venue, hotel, or destination" />
                </FormField>
                <FormField label="Passengers" htmlFor="quote-passengers">
                  <Input id="quote-passengers" type="number" min={1} value={passengersInput} onChange={(event) => setPassengersInput(event.target.value)} />
                </FormField>
                <FormField label="Pickup date & time" htmlFor="quote-datetime">
                  <Input id="quote-datetime" type="datetime-local" value={datetime} onChange={(event) => setDatetime(event.target.value)} />
                </FormField>
                <FormField label="Distance (mi)" htmlFor="quote-distance">
                  <Input id="quote-distance" type="number" min={0} value={distanceInput} onChange={(event) => setDistanceInput(event.target.value)} />
                </FormField>
                <FormField label="Drive time (min)" htmlFor="quote-duration">
                  <Input id="quote-duration" type="number" min={0} value={durationInput} onChange={(event) => setDurationInput(event.target.value)} />
                </FormField>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => handleSelect(vehicle)}
                    className={`premium-surface w-full p-6 text-left transition-all group hover:-translate-y-0.5 ${
                      vehicle.isBestFit ? "border-[#cdb59a] bg-background" : "hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-medium text-foreground">{vehicle.name}</h2>
                          {vehicle.isBestFit ? (
                            <span className="rounded-full border border-[#d9c7b2] bg-[#eadfd1] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8d6f56]">
                              recommended
                            </span>
                          ) : null}
                          {vehicle.isCustom ? (
                            <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                              custom
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{vehicle.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {vehicle.features.map((feature) => (
                            <span
                              key={feature}
                              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-medium tracking-[-0.03em] text-foreground">{vehicle.price}</p>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                      <span>{vehicle.isCustom ? "request quote" : "select"}</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </SectionCard>

            <div className="space-y-6">
              <TripSummaryCard
                eyebrow="Trip summary"
                title="Current request details"
                route={routeText}
                dateTime={datetime || "Pickup time to be confirmed"}
                passengers={passengers}
                details={[
                  { label: "Distance", value: distance > 0 ? `${distance.toFixed(1)} miles` : "Route estimate unavailable" },
                  { label: "Drive time", value: duration > 0 ? `${duration} min` : "Pending route estimate" },
                ]}
              />

              <SectionCard
                eyebrow="Booking policy"
                title="Flexible until confirmed"
                description="You can still edit trip details before sending the final request."
              >
                <div className="space-y-3">
                  <p className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                    No payment required until your booking is confirmed.
                  </p>
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Edit trip details
                  </Button>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <QuoteContent />
    </Suspense>
  )
}
