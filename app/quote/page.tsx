"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { ArrowRight } from "lucide-react"

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
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-2xl font-normal text-foreground lowercase mb-3">
              select your ride
            </h1>
            <p className="text-sm text-muted-foreground lowercase">
              {passengers} passengers
              {pickup && dropoff && (
                <span className="block mt-1">
                  {pickup} to {dropoff}
                </span>
              )}
            </p>
          </div>

          {/* Vehicle Options */}
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => handleSelect(vehicle)}
                className={`w-full text-left p-6 rounded-lg border transition-all group ${
                  vehicle.isBestFit
                    ? "bg-card border-foreground"
                    : "bg-card border-border hover:border-foreground/40"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-medium text-foreground lowercase">
                        {vehicle.name}
                      </h3>
                      {vehicle.isBestFit && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 lowercase">
                      {vehicle.description}
                    </p>
                    {vehicle.features && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                        {vehicle.features.map((feature) => (
                          <span key={feature} className="text-xs text-muted-foreground lowercase flex items-center gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-medium text-foreground">
                      {vehicle.price}
                    </p>
                    {vehicle.isCustom && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        custom
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end mt-5 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  <span className="lowercase">
                    {vehicle.isCustom ? "request quote" : "select"}
                  </span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
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
