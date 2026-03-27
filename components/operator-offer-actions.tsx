"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function OperatorOfferActions({ offerId, disabled }: { offerId: string; disabled?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runAction = (action: "accept" | "decline") => {
    startTransition(async () => {
      setError(null);
      const response = await fetch(`/api/operator/offers/${offerId}/${action}`, {
        method: "POST"
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Action failed.");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button disabled={disabled || isPending} onClick={() => runAction("accept")}>
          Accept
        </Button>
        <Button disabled={disabled || isPending} onClick={() => runAction("decline")} variant="secondary">
          Decline
        </Button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
