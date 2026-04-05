"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminBookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [price, setPrice] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runReviewAction = (action: "request_quote" | "cancel_booking" | "mark_confirmed") => {
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
    <div className="premium-panel space-y-5 p-6">
      <div className="flex flex-wrap gap-2">
        <Button disabled={isPending} onClick={() => runReviewAction("request_quote")}>
          Request quote
        </Button>
        <Button disabled={isPending} variant="secondary" onClick={() => runReviewAction("mark_confirmed")}>
          Mark confirmed
        </Button>
        <Button disabled={isPending} variant="secondary" onClick={() => runReviewAction("cancel_booking")}>
          Close booking
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <FormField label="New total">
          <Input
            type="number"
            placeholder="New trip total ($)"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </FormField>
        <FormField label="Reason">
          <Input
            placeholder="Why the price changed (customer sees this)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </FormField>
        <Button disabled={isPending} variant="secondary" className="h-12" onClick={runPriceOverride}>
          Send to customer
        </Button>
      </div>

      {message ? <p className="text-sm text-[#597358]">{message}</p> : null}
      {error ? <p className="text-sm text-[#8c5d50]">{error}</p> : null}
    </div>
  );
}
