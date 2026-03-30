"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ArrowRight } from "lucide-react"

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
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-2xl font-normal text-foreground lowercase mb-3">
              charter flight
            </h1>
            <p className="text-sm text-muted-foreground lowercase">
              this trip requires a custom quote
            </p>
          </div>

          {/* Form */}
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

            <div>
              <label className="block text-xs text-muted-foreground mb-2 lowercase">
                trip details
              </label>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="destinations, dates, passengers, requirements..."
                className="w-full bg-card border border-border rounded px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors resize-none lowercase"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground py-4 rounded text-sm font-medium lowercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-8 group disabled:opacity-60"
            >
              {isSubmitting ? "submitting..." : "submit request"}
              {!isSubmitting && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>
          </form>

          {/* Trust */}
          <p className="text-xs text-muted-foreground text-center mt-8 lowercase">
            we respond within 24 hours
          </p>
        </div>
      </div>
    </main>
  )
}
