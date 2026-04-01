"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { FormField } from "@/components/shared/FormField"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
