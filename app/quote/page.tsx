"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import Navbar from "@/components/navbar"
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
    <main className="min-h-screen bg-[#f7f4ef]">
      <Navbar />
      <div className="pt-32 pb-20 px-4 lg:px-0 flex justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-[32px] border border-[#e7dfd3] bg-white p-10 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
            {/* Header */}
            <div className="mb-8 text-center text-xs text-black/45">
              Step 1 of 2 · Get your quote
            </div>
            <h1 className="mb-1 text-center text-2xl font-medium text-black lowercase">
              select your ride
            </h1>
            <p className="mb-8 text-center text-black/50 text-sm">
              {passengers} passengers
              {pickup && dropoff && (
                <span className="block mt-1">
                  {pickup} to {dropoff}
                </span>
              )}
            </p>
            {/* Vehicle Options */}
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleSelect(vehicle)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all group ${
                    vehicle.isBestFit
                      ? "bg-[#f7f4ef] border-[#a68a6d]"
                      : "bg-[#f7f4ef] border-black/10 hover:border-[#a68a6d]/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-medium text-black lowercase">
                          {vehicle.name}
                        </h3>
                        {vehicle.isBestFit && (
                          <span className="text-[10px] uppercase tracking-[0.12em] text-[#a68a6d] bg-[#f3e9db] rounded-full px-2 py-0.5 font-semibold">
                            recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-black/50 mt-1 lowercase">
                        {vehicle.description}
                      </p>
                      {vehicle.features && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {vehicle.features.map((feature) => (
                            <span key={feature} className="inline-flex items-center rounded-full border border-[#e7dfd3] bg-[#f3e9db] px-3 py-1 text-xs font-medium text-[#a68a6d]">
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-medium text-black">
                        {vehicle.price}
                      </p>
                      {vehicle.isCustom && (
                        <span className="text-[10px] uppercase tracking-[0.12em] text-[#a68a6d] bg-[#f3e9db] rounded-full px-2 py-0.5 font-semibold">
                          custom
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end mt-6 text-sm text-black/45 group-hover:text-black transition-colors">
                    <span className="lowercase">
                      {vehicle.isCustom ? "request quote" : "select"}
                    </span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 text-center text-xs text-black/45">
              No payment required until you confirm your booking.
            </div>
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
