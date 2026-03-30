"use client"

import { Navbar } from "@/components/navbar"
import { ArrowRight } from "lucide-react"

export default function BookingStatusPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-md mx-auto">
          {/* Status Header */}
          <div className="text-center mb-16">
            <p className="text-xs text-muted-foreground mb-4 lowercase">
              status
            </p>
            <h1 className="text-3xl font-normal text-foreground lowercase mb-4">
              matching
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground lowercase">
                operator offer incoming
              </p>
            </div>
          </div>

          {/* ETA Card */}
          <div className="bg-card border border-border rounded-lg p-6 text-center mb-12">
            <p className="text-xs text-muted-foreground mb-2 lowercase">
              estimated time
            </p>
            <p className="text-3xl font-normal text-foreground">
              12 min
            </p>
          </div>

          {/* Trip Details */}
          <div className="mb-12 pb-8 border-b border-border">
            <p className="text-xs text-muted-foreground mb-6 lowercase">
              trip details
            </p>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground lowercase">route</span>
                <span className="text-sm text-foreground lowercase">charlotte to airport</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground lowercase">passengers</span>
                <span className="text-sm text-foreground">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground lowercase">vehicle</span>
                <span className="text-sm text-foreground lowercase">mini bus</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground lowercase">price</span>
                <span className="text-sm text-foreground">$350</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-12">
            <p className="text-xs text-muted-foreground mb-8 lowercase">
              progress
            </p>
            <div className="space-y-6">
              {[
                { number: "01", title: "request received", done: true },
                { number: "02", title: "matching providers", active: true },
                { number: "03", title: "operator accepted" },
                { number: "04", title: "ride confirmed" },
              ].map((step) => (
                <div key={step.number} className="flex items-center gap-6">
                  <span className={`text-xs font-mono ${
                    step.done || step.active ? 'text-foreground' : 'text-muted-foreground/40'
                  }`}>
                    {step.number}
                  </span>
                  <span className={`text-sm lowercase flex-1 ${
                    step.done || step.active ? 'text-foreground' : 'text-muted-foreground/60'
                  }`}>
                    {step.title}
                  </span>
                  {step.done && (
                    <span className="text-xs text-muted-foreground">done</span>
                  )}
                  {step.active && (
                    <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <button className="w-full bg-card border border-border text-foreground py-4 rounded text-sm font-medium lowercase flex items-center justify-center gap-2 hover:border-foreground transition-colors group">
            cancel request
          </button>

          {/* Contact */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground lowercase">
              need help?{" "}
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
