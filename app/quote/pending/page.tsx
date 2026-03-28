"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Check, ArrowRight } from "lucide-react"

export default function PendingReviewPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-lg mx-auto">
          {/* Success indicator */}
          <div className="flex justify-center mb-10">
            <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center">
              <Check className="h-6 w-6 text-foreground" strokeWidth={2} />
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-foreground mb-4 lowercase">
              request submitted
            </h1>
            <p className="text-base text-muted-foreground lowercase">
              we're matching you with a provider
            </p>
          </div>

          {/* Time estimate */}
          <div className="text-center mb-16">
            <p className="text-xs text-muted-foreground mb-3 lowercase">
              estimated response time
            </p>
            <p className="text-2xl text-foreground lowercase">
              30–60 minutes
            </p>
            <p className="text-xs text-muted-foreground mt-3 lowercase">
              larger trips may take longer
            </p>
          </div>

          {/* Trust lines */}
          <div className="space-y-3 mb-16">
            <p className="text-xs text-muted-foreground text-center lowercase">
              vetted operators only
            </p>
            <p className="text-xs text-muted-foreground text-center lowercase">
              no charge until confirmed
            </p>
          </div>

          {/* Timeline */}
          <div className="mb-16">
            <p className="text-xs text-muted-foreground mb-8 lowercase">
              what happens next
            </p>
            <div className="space-y-6">
              {[
                { number: "01", title: "request received", done: true },
                { number: "02", title: "matching providers", active: true },
                { number: "03", title: "quote delivered" },
                { number: "04", title: "confirm & book" },
              ].map((step) => (
                <div key={step.number} className="flex items-baseline gap-6">
                  <span className={`text-xs font-mono ${
                    step.done || step.active ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}>
                    {step.number}
                  </span>
                  <span className={`text-base lowercase ${
                    step.done || step.active ? 'text-foreground' : 'text-muted-foreground/60'
                  }`}>
                    {step.title}
                  </span>
                  {step.done && (
                    <Check className="h-4 w-4 text-foreground ml-auto" />
                  )}
                  {step.active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-foreground animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link 
            href="/booking/status"
            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-4 rounded text-sm font-medium lowercase group hover:opacity-90 transition-opacity"
          >
            view status
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Contact */}
          <div className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground lowercase">
              questions?{" "}
              <a href="mailto:support@groupride.com" className="text-foreground hover:underline">
                support@groupride.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
