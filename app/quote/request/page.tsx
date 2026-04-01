"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"
import { SectionEyebrow } from "@/components/shared/SectionEyebrow"
import { FormField } from "@/components/shared/FormField"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function QuoteRequestPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    router.push("/quote/pending")
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
          </form>
        </div>
      </section>
      <Footer />
    </main>
  )
}
