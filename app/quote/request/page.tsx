"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { FormField } from "@/components/shared/FormField"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { TripRequestInput } from "@/lib/types"

export default function QuoteRequestPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const payload: TripRequestInput = {
      tripType: "one_way",
      tripIntent: "other",
      pickupLocation: { addressLine: "Custom itinerary", city: "Charlotte", state: "NC" },
      dropoffLocation: { addressLine: "Custom destination", city: "Charlotte", state: "NC" },
      stops: [],
      pickupDateTimeLocal: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16),
      passengers: 1,
      luggageCount: 0,
      notes: details,
      contactName: name,
      contactEmail: email,
      contactPhone: phone,
    }

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const result = (await response.json()) as { error?: string; booking?: { id: string } }
    setIsSubmitting(false)

    if (!response.ok || !result.booking) {
      setError(result.error ?? "Unable to submit your request.")
      return
    }

    router.push(`/quote/pending?bookingId=${result.booking.id}`)
  }

  return (
    <main className="min-h-screen bg-background pt-24">
      <Navbar />
      <section className="page-shell py-16 md:py-20">
        <div className="mx-auto max-w-2xl premium-panel p-7 md:p-10">
          <SectionEyebrow>Custom itinerary</SectionEyebrow>
          <h1 className="mt-5 text-4xl font-medium tracking-[-0.05em] text-foreground">
            Request a tailored transportation quote.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            For charter flights, complex multi-city trips, or premium custom routing, our team will build the right plan manually.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
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
            <FormField label="Trip details" htmlFor="details">
              <Textarea
                id="details"
                rows={5}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Destinations, dates, passengers, luggage, and anything else we should know..."
              />
            </FormField>

            <Button type="submit" disabled={isSubmitting} size="lg" className="group mt-4 w-full">
              {isSubmitting ? "submitting..." : "submit request"}
              {!isSubmitting && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </Button>
            {error ? <p className="text-sm text-[#8c5d50]">{error}</p> : null}
          </form>
        </div>
      </section>
      <Footer />
    </main>
  )
}
