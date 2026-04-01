"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { DashboardShell } from "@/components/shared/DashboardShell"
import { DashboardNav } from "@/components/dashboard-nav"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
    <DashboardShell
      sidebar={
        <DashboardNav
          currentPath="/operator"
          items={[
            { href: "/operator", label: "Overview" },
            { href: "/operator", label: "Bookings" },
            { href: "/operator", label: "Pricing" },
          ]}
        />
      }
      header={
        <PageHeader
          eyebrow="Operator portal"
          title="Incoming trip opportunities"
          description="Review live requests, accept the right fits, and keep your calendar filled with premium group work."
          meta={
            <>
              <Badge variant="neutral">Warm dispatch workflow</Badge>
              <Badge variant="blue">Real-time demand</Badge>
            </>
          }
          actions={
            <Button asChild variant="outline">
              <Link href="/">Back to site</Link>
            </Button>
          }
        />
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="New requests" value={pendingRequests.length} />
        <StatCard label="Accepted trips" value={acceptedRequests.length} />
        <StatCard label="Close rate" value="67%" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium tracking-[-0.04em] text-foreground">Available requests</h2>
          <p className="text-sm text-muted-foreground">{pendingRequests.length} waiting for response</p>
        </div>

        {pendingRequests.length === 0 ? (
          <EmptyState title="No new requests right now" description="New GroupRide trip opportunities will appear here as they are routed to your fleet." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {pendingRequests.map((request) => (
              <div key={request.id} className="premium-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium text-foreground">{request.route}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {request.passengers} passengers • {request.vehicle}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{request.date}</p>
                  </div>
                  <p className="text-2xl font-medium tracking-[-0.04em] text-foreground">{request.price}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
                  <Button className="group flex-1" onClick={() => handleAccept(request.id)}>
                    Accept
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleDecline(request.id)}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {acceptedRequests.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-medium tracking-[-0.04em] text-foreground">Accepted</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {acceptedRequests.map((request) => (
              <div key={request.id} className="premium-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-medium text-foreground">{request.route}</h3>
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {request.passengers} passengers • {request.vehicle}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{request.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-medium tracking-[-0.04em] text-foreground">{request.price}</p>
                    <div className="mt-2">
                      <StatusBadge status="confirmed" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </DashboardShell>
  )
}
