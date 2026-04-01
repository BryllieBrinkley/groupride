import { createId, getStore } from "@/lib/data/demo-store";
import type { Payout } from "@/lib/types";
import { nowIso } from "@/lib/utils";

export function listPayoutsForOperator(operatorId: string) {
  return getStore().payouts.filter((payout) => payout.operatorId === operatorId);
}

export function getPayoutById(payoutId: string) {
  return getStore().payouts.find((payout) => payout.id === payoutId) ?? null;
}

export function createPayoutForBooking(input: {
  bookingId: string;
  operatorId: string;
  grossAmount: number;
  platformFeeAmount: number;
}) {
  const payout: Payout = {
    id: createId("payout"),
    bookingId: input.bookingId,
    operatorId: input.operatorId,
    provider: "demo",
    grossAmount: input.grossAmount,
    platformFeeAmount: input.platformFeeAmount,
    payoutAmount: input.grossAmount - input.platformFeeAmount,
    status: "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  getStore().payouts.unshift(payout);
  return payout;
}

export function markPayoutPaid(payoutId: string) {
  const payout = getPayoutById(payoutId);
  if (!payout) {
    throw new Error("Payout not found.");
  }

  payout.status = "paid";
  payout.paidAt = nowIso();
  payout.updatedAt = nowIso();
  return payout;
}
