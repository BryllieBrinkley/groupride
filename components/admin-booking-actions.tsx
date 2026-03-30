"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminBookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [price, setPrice] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runReviewAction = (action: "route_offers" | "close_unfulfilled" | "mark_no_supply") => {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const response = await fetch(`/api/admin/bookings/${bookingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to update booking.");
        return;
      }
      setMessage(payload.message ?? "Booking updated.");
      router.refresh();
    });
  };

  const runPriceOverride = () => {
    if (!price || !reason) {
      setError("Amount and reason are required.");
      return;
    }
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const response = await fetch(`/api/admin/bookings/${bookingId}/override-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(price), reason })
      });
      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(payload.error ?? "Price override failed.");
        return;
      }
      setPrice("");
      setReason("");
      setMessage(payload.message ?? "Updated.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button disabled={isPending} onClick={() => runReviewAction("route_offers")}>
          Send to operators
        </Button>
        <Button disabled={isPending} variant="secondary" onClick={() => runReviewAction("mark_no_supply")}>
          No vehicles available
        </Button>
        <Button disabled={isPending} variant="secondary" onClick={() => runReviewAction("close_unfulfilled")}>
          Close as unfulfilled
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Input
          type="number"
          placeholder="New trip total ($)"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
        <Input
          placeholder="Why the price changed (customer sees this)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <Button disabled={isPending} variant="secondary" className="h-12" onClick={runPriceOverride}>
          Send to customer
        </Button>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
