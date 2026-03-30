import Stripe from "stripe";

import { getStore } from "@/lib/data/demo-store";
import { env } from "@/lib/env";
import type { Booking, PaymentAttempt, PaymentCaptureResult, PaymentMethodRecord } from "@/lib/types";
import { makeId, nowIso } from "@/lib/utils";

let stripeClient: Stripe | undefined;

function getStripe() {
  if (!env.stripeSecretKey) {
    return undefined;
  }

  stripeClient ??= new Stripe(env.stripeSecretKey);
  return stripeClient;
}

export function savePaymentMethod(booking: Booking, providedPaymentMethodId?: string) {
  const store = getStore();
  const paymentMethod: PaymentMethodRecord = {
    id: makeId("pm"),
    bookingId: booking.id,
    customerEmail: getBookingEmail(booking.customerProfileId),
    provider: providedPaymentMethodId && !env.demoMode ? "stripe" : "demo",
    providerPaymentMethodId: providedPaymentMethodId ?? makeId("pm_demo"),
    status: "saved",
    createdAt: nowIso()
  };

  store.paymentMethods.unshift(paymentMethod);
  return paymentMethod;
}

export async function capturePayment(booking: Booking): Promise<PaymentCaptureResult> {
  const store = getStore();
  const paymentMethod = store.paymentMethods.find((entry) => entry.bookingId === booking.id);
  const stripe = getStripe();

  if (stripe && paymentMethod?.provider === "stripe" && !env.demoMode) {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(booking.activeAmount * 100),
      currency: "usd",
      payment_method: paymentMethod.providerPaymentMethodId,
      confirm: true,
      off_session: true,
      metadata: { bookingId: booking.id }
    });

    const statusMap: Record<string, PaymentCaptureResult["paymentStatus"]> = {
      succeeded: "paid",
      requires_action: "requires_action",
      processing: "processing"
    };
    const paymentStatus = statusMap[intent.status] ?? "requires_action";

    const result: PaymentCaptureResult = {
      paymentStatus,
      paymentIntentId: intent.id,
      recoveryToken: paymentStatus === "requires_action" ? makeId("recover") : undefined,
      failureReason: paymentStatus === "requires_action" ? "Customer authentication required." : undefined
    };

    recordAttempt(booking.id, booking.activeAmount, result);
    return result;
  }

  const requiresAction =
    booking.activeAmount >= 900 || getBookingEmail(booking.customerProfileId).includes("action-required");

  const result: PaymentCaptureResult = {
    paymentStatus: requiresAction ? "requires_action" : "paid",
    paymentIntentId: makeId("pi_demo"),
    recoveryToken: requiresAction ? makeId("recover") : undefined,
    failureReason: requiresAction ? "Additional customer authentication required." : undefined
  };

  recordAttempt(booking.id, booking.activeAmount, result);
  return result;
}

export function refundPayment(booking: Booking, amount: number) {
  const store = getStore();
  const attempt: PaymentAttempt = {
    id: makeId("refund"),
    bookingId: booking.id,
    amount,
    status: "refunded",
    provider: "demo",
    providerIntentId: makeId("refund_demo"),
    createdAt: nowIso()
  };
  store.paymentAttempts.unshift(attempt);
  return attempt;
}

function recordAttempt(bookingId: string, amount: number, result: PaymentCaptureResult) {
  const store = getStore();
  const attempt: PaymentAttempt = {
    id: makeId("pay"),
    bookingId,
    amount,
    status: result.paymentStatus,
    provider: env.stripeSecretKey && !env.demoMode ? "stripe" : "demo",
    providerIntentId: result.paymentIntentId,
    failureReason: result.failureReason,
    createdAt: nowIso()
  };

  store.paymentAttempts.unshift(attempt);
  return attempt;
}

function getBookingEmail(customerProfileId: string) {
  const store = getStore();
  return store.customers.find((customer) => customer.id === customerProfileId)?.email ?? "unknown@groupride.app";
}
