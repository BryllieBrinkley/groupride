"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export function Hero() {
  const router = useRouter()
  const [pickupLocation, setPickupLocation] = useState("")
  const [dropoffLocation, setDropoffLocation] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [passengers, setPassengers] = useState("")

  const handleGetQuote = () => {
    const params = new URLSearchParams({
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      datetime: dateTime,
      passengers: passengers,
    })
    router.push(`/quote?${params.toString()}`)
  }

  return (
    <section className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Typography */}
      <div className="flex-1 flex flex-col justify-center px-6 pt-24 pb-12 lg:px-12 lg:pt-0 lg:pb-0">
        <div className="max-w-md">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-foreground lowercase leading-[1.1]">
            group travel,
            <br />
            handled.
          </h1>
          
          <p className="mt-8 text-base text-muted-foreground lowercase leading-relaxed">
            6–100+ passengers
            <br />
            airports / events / teams
          </p>
          
          <p className="mt-8 text-xs text-muted-foreground/70 lowercase">
            no charge until confirmed
            <br />
            vetted operators only
          </p>
        </div>
      </div>
      
      {/* Right Side - Booking Form */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12 lg:px-12 lg:py-0">
        <div className="w-full max-w-sm">
          <div className="bg-card rounded-lg border border-border p-6 lg:p-8">
            <div className="space-y-4">
              {/* Pickup */}
              <div>
                <label className="block text-xs text-muted-foreground mb-2 lowercase">
                  pickup
                </label>
                <input
                  type="text"
                  placeholder="address or airport"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full bg-background border border-border rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors lowercase"
                />
              </div>
              
              {/* Dropoff */}
              <div>
                <label className="block text-xs text-muted-foreground mb-2 lowercase">
                  dropoff
                </label>
                <input
                  type="text"
                  placeholder="address or airport"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  className="w-full bg-background border border-border rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors lowercase"
                />
              </div>
              
              {/* Date & Time */}
              <div>
                <label className="block text-xs text-muted-foreground mb-2 lowercase">
                  date & time
                </label>
                <input
                  type="text"
                  placeholder="select date and time"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  onFocus={(e) => e.target.type = 'datetime-local'}
                  onBlur={(e) => { if (!e.target.value) e.target.type = 'text' }}
                  className="w-full bg-background border border-border rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors lowercase"
                />
              </div>
              
              {/* Passengers */}
              <div>
                <label className="block text-xs text-muted-foreground mb-2 lowercase">
                  passengers
                </label>
                <input
                  type="number"
                  placeholder="number of passengers"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  min="1"
                  className="w-full bg-background border border-border rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors lowercase"
                />
              </div>
              
              {/* CTA Button */}
              <button 
                onClick={handleGetQuote}
                className="w-full bg-primary text-primary-foreground py-4 rounded text-sm font-medium lowercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-6 group"
              >
                find my ride
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
