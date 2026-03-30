"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, X } from "lucide-react"

interface Request {
  id: string
  route: string
  passengers: number
  price: string
  vehicle: string
  date: string
  status: "pending" | "accepted" | "declined"
}

export default function OperatorDashboard() {
  const [requests, setRequests] = useState<Request[]>([
    {
      id: "1",
      route: "charlotte to airport",
      passengers: 12,
      price: "$350",
      vehicle: "mini bus",
      date: "mar 28, 2:30pm",
      status: "pending",
    },
    {
      id: "2",
      route: "downtown to stadium",
      passengers: 24,
      price: "$450",
      vehicle: "charter bus",
      date: "mar 29, 6:00pm",
      status: "pending",
    },
    {
      id: "3",
      route: "hotel to convention center",
      passengers: 8,
      price: "$180",
      vehicle: "sprinter van",
      date: "mar 30, 9:00am",
      status: "pending",
    },
  ])

  const handleAccept = (id: string) => {
    setRequests(requests.map(r => 
      r.id === id ? { ...r, status: "accepted" as const } : r
    ))
  }

  const handleDecline = (id: string) => {
    setRequests(requests.map(r => 
      r.id === id ? { ...r, status: "declined" as const } : r
    ))
  }

  const pendingRequests = requests.filter(r => r.status === "pending")
  const acceptedRequests = requests.filter(r => r.status === "accepted")

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between h-16 px-6 lg:px-12">
          <Link href="/" className="text-sm font-medium text-foreground lowercase tracking-tight">
            groupride
            <span className="text-muted-foreground ml-2">operator</span>
          </Link>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase">
            logout
          </button>
        </div>
      </header>
      
      <div className="pt-28 pb-20 px-6 lg:px-12">
        <div className="max-w-2xl mx-auto">
          {/* Available Requests */}
          <section className="mb-16">
            <div className="flex items-baseline justify-between mb-8">
              <h1 className="text-xl font-normal text-foreground lowercase">
                available requests
              </h1>
              <span className="text-sm text-muted-foreground">
                {pendingRequests.length} new
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground lowercase">
                  no new requests right now
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-card border border-border rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-base font-medium text-foreground lowercase">
                          {request.route}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 lowercase">
                          {request.passengers} passengers / {request.vehicle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 lowercase">
                          {request.date}
                        </p>
                      </div>
                      <p className="text-xl font-medium text-foreground">
                        {request.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="flex-1 bg-primary text-primary-foreground py-3 rounded text-sm font-medium lowercase flex items-center justify-center gap-2 hover:opacity-90 transition-opacity group"
                      >
                        accept
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="px-4 py-3 border border-border rounded text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors lowercase"
                      >
                        decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Accepted Requests */}
          {acceptedRequests.length > 0 && (
            <section>
              <h2 className="text-lg font-normal text-foreground lowercase mb-6">
                accepted
              </h2>
              <div className="space-y-4">
                {acceptedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-card border border-border rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-medium text-foreground lowercase">
                            {request.route}
                          </h3>
                          <Check className="h-4 w-4 text-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 lowercase">
                          {request.passengers} passengers / {request.vehicle}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 lowercase">
                          {request.date}
                        </p>
                      </div>
                      <p className="text-lg font-medium text-foreground">
                        {request.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
