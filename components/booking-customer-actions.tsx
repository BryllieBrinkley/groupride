"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function BookingCustomerActions({
  bookingId,
  canCancel,
  approvalToken,
  recoveryToken
}: {
  bookingId: string;
  canCancel: boolean;
  approvalToken?: string;
  recoveryToken?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const run = (path: string, body?: object) => {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const response = await fetch(path, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(payload.error ?? "Request failed.");
        return;
      }
      setMessage(payload.message ?? "Updated.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {canCancel ? (
          <Button disabled={isPending} variant="secondary" onClick={() => run(`/api/bookings/${bookingId}/cancel`)}>
            Cancel booking
          </Button>
        ) : null}
        {approvalToken ? (
          <Button
            disabled={isPending}
            onClick={() => run(`/api/bookings/${bookingId}/approve-revision`, { token: approvalToken })}
          >
            Approve revised quote
          </Button>
        ) : null}
        {recoveryToken ? (
          <Button
            disabled={isPending}
            onClick={() => run(`/api/bookings/${bookingId}/recover-payment`, { token: recoveryToken })}
          >
            Retry payment
          </Button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
