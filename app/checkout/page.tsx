"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ArrowRight } from "lucide-react"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const vehicle = searchParams.get("vehicle") || "minibus"
  const price = searchParams.get("price") || "$350"
  const pickup = searchParams.get("pickup") || ""
  const dropoff = searchParams.get("dropoff") || ""
  const passengers = searchParams.get("passengers") || ""

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const vehicleNames: Record<string, string> = {
    sprinter: "sprinter van",
    minibus: "mini bus",
    charter: "charter bus",
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/quote/pending")
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-md mx-auto">
          {/* Ride Summary */}
          <div className="mb-12 pb-8 border-b border-border">
            <p className="text-xs text-muted-foreground mb-4 lowercase">
              your ride
            </p>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-medium text-foreground lowercase">
                  {vehicleNames[vehicle] || vehicle}
                </h2>
                {pickup && dropoff && (
                  <p className="text-sm text-muted-foreground mt-2 lowercase">
                    {pickup} to {dropoff}
                  </p>
                )}
                {passengers && (
                  <p className="text-sm text-muted-foreground lowercase">
                    {passengers} passengers
                  </p>
                )}
              </div>
              <p className="text-2xl font-medium text-foreground">
                {price}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-muted-foreground mb-2 lowercase">
                name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your name"
                className="w-full bg-card border border-border rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors lowercase"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2 lowercase">
                email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email address"
                className="w-full bg-card border border-border rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors lowercase"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2 lowercase">
                phone
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="phone number"
                className="w-full bg-card border border-border rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors lowercase"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-4 rounded text-sm font-medium lowercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-8 group"
            >
              confirm request
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Trust */}
          <p className="text-xs text-muted-foreground text-center mt-8 lowercase">
            no charge until confirmed
          </p>
        </div>
      </div>
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
