"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { Button } from "@/components/ui/button"

interface Vehicle {
  id: string
  name: string
  description: string
  price: string
  isBestFit?: boolean
  isCustom?: boolean
  features?: string[]
}

function QuoteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const passengers = parseInt(searchParams.get("passengers") || "12")
  const pickup = searchParams.get("pickup") || ""
  const dropoff = searchParams.get("dropoff") || ""
  const distance = parseInt(searchParams.get("distance") || "0")
  const duration = parseInt(searchParams.get("duration") || "0")
  
  // Show charter flight only for long-distance trips (>250 miles or >4 hours)
  const isLongDistance = distance > 250 || duration > 240

  const vehicles: Vehicle[] = [
    {
      id: "sprinter",
      name: "sprinter van",
      description: "seats 10-15, ideal for small groups",
      price: "$220",
      isBestFit: passengers <= 14,
      features: ["comfortable seating", "luggage space"],
    },
    {
      id: "minibus",
      name: "mini bus",
      description: "seats 20-35, more space",
      price: "$350",
      isBestFit: passengers >= 15 && passengers <= 35,
      features: ["extra legroom", "onboard restroom"],
    },
    {
      id: "charter",
      name: "charter bus",
      description: "seats 36-56, full amenities",
      price: "$650",
      isBestFit: passengers > 35,
      features: ["wifi available", "climate control"],
    },
    ...(isLongDistance ? [{
      id: "flight",
      name: "charter flight",
      description: "seats 6-30+, premium travel",
      price: "from $6,000",
      isCustom: true,
      features: ["skip traffic", "long-distance trips"],
    }] : []),
  ]

  const handleSelect = (vehicle: Vehicle) => {
    if (vehicle.isCustom) {
      router.push("/quote/request")
    } else {
      const params = new URLSearchParams({
        vehicle: vehicle.id,
        price: vehicle.price,
        pickup,
        dropoff,
        passengers: passengers.toString(),
      })
      router.push(`/checkout?${params.toString()}`)
    }
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
          </div>

          <div className="grid gap-5 md:grid-cols-2">
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleSelect(vehicle)}
                  className={`premium-panel w-full p-7 text-left transition-all group hover:-translate-y-0.5 ${
                    vehicle.isBestFit
                      ? "border-[#cdb59a] bg-background"
                      : "hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-medium text-foreground">
                          {vehicle.name}
                        </h3>
                        {vehicle.isBestFit && (
                          <span className="rounded-full border border-[#d9c7b2] bg-[#eadfd1] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8d6f56]">
                            recommended
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {vehicle.description}
                      </p>
                      {vehicle.features && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {vehicle.features.map((feature) => (
                            <span key={feature} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-medium tracking-[-0.03em] text-foreground">
                        {vehicle.price}
                      </p>
                      {vehicle.isCustom && (
                        <span className="mt-2 inline-flex rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          custom
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-end text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                    <span>
                      {vehicle.isCustom ? "request quote" : "select"}
                    </span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
          </div>
          <div className="mt-8">
            <div className="premium-surface flex flex-col items-start justify-between gap-4 px-6 py-5 md:flex-row md:items-center">
              <p className="text-sm text-muted-foreground">
                No payment required until you confirm your booking.
              </p>
              <Button variant="outline" onClick={() => router.push("/")}>
                Edit trip details
              </Button>
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
