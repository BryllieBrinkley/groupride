"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { TripSummaryCard } from "@/components/shared/TripSummaryCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

type AssignedTrip = {
  id: string;
  reference: string;
  title: string;
  route: string;
  dateTime: string;
  passengers: number;
  vehicle: string;
  amount: number;
  status: string;
};

export function OperatorAssignedClient({ trips }: { trips: AssignedTrip[] }) {
  const [localTrips, setLocalTrips] = useState(trips);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const markCompleted = (bookingId: string) => {
    startTransition(async () => {
      setMessage(null);
      setError(null);

      try {
        // Demo API flow: optimistic UI on success, while full dispatch eventing is out of scope for this pass.
        const response = await fetch(`/api/operator/bookings/${bookingId}/complete`, {
          method: "POST",
        });
        const payload = (await response.json()) as { ok?: boolean; error?: string };
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? "Unable to mark trip as completed.");
        }

        setLocalTrips((previous) =>
          previous.filter((trip) => trip.id !== bookingId),
        );
        setMessage("Trip marked as completed. It is now visible under Completed.");
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Unable to mark trip as completed.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {localTrips.length === 0 ? (
        <EmptyState
          title="No assigned trips"
          description="Once a booking is assigned to your fleet, it will show up here with current status and payout context."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {localTrips.map((trip) => (
            <TripSummaryCard
              key={trip.id}
              eyebrow={`Reference ${trip.reference}`}
              title={trip.title}
              route={trip.route}
              dateTime={trip.dateTime}
              passengers={trip.passengers}
              vehicle={trip.vehicle}
              amount={trip.amount}
              status={trip.status}
              compact
              footer={
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Mark complete after the ride is finished.</span>
                  <Button disabled={isPending} onClick={() => markCompleted(trip.id)}>
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    Mark completed
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}

      {message ? <p className="text-sm text-[#597358]">{message}</p> : null}
      {error ? <p className="text-sm text-[#8c5d50]">{error}</p> : null}
    </div>
  );
}
