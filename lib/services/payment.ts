import Stripe from "stripe";

import { createId, getStore } from "@/lib/data/demo-store";
import { env } from "@/lib/env";
import type { Booking, Payment, PaymentCaptureResult, Quote } from "@/lib/types";
import { nowIso } from "@/lib/utils";

let stripeClient: Stripe | undefined;

function getStripe() {
  if (!env.stripeSecretKey) {
    return undefined;
  }

  stripeClient ??= new Stripe(env.stripeSecretKey);
  return stripeClient;
}

export function listPaymentsForCustomer(customerProfileId: string) {
  return getStore().payments.filter((payment) => payment.customerProfileId === customerProfileId);
}

export function getPaymentByBookingId(bookingId: string) {
  return getStore().payments.find((payment) => payment.bookingId === bookingId) ?? null;
}

export async function createPaymentIntent(input: {
  booking: Booking;
  quote: Quote;
}) {
  const existing = getPaymentByBookingId(input.booking.id);
  if (existing && ["pending", "requires_action", "succeeded"].includes(existing.status)) {
    return existing;
  }

  const stripe = getStripe();
  const payment: Payment = {
    id: createId("payment"),
    bookingId: input.booking.id,
    quoteId: input.quote.id,
    customerProfileId: input.booking.customerProfileId,
    provider: stripe && !env.demoMode ? "stripe" : "demo",
    paymentIntentId: undefined,
    paymentMethodId: undefined,
    amount: input.quote.amount,
    currency: "usd",
    status: "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  if (stripe && !env.demoMode) {
    const intent = await stripe.paymentIntents.create({
      amount: input.quote.amount * 100,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        bookingId: input.booking.id,
        quoteId: input.quote.id,
      },
    });

    payment.paymentIntentId = intent.id;
  } else {
    payment.paymentIntentId = createId("pi_demo");
  }

  getStore().payments.unshift(payment);
  return payment;
}

export async function capturePayment(paymentId: string): Promise<PaymentCaptureResult> {
  const payment = getStore().payments.find((entry) => entry.id === paymentId);
  if (!payment) {
    throw new Error("Payment not found.");
  }

  payment.status = "succeeded";
  payment.updatedAt = nowIso();

  return {
    paymentStatus: payment.status,
    paymentIntentId: payment.paymentIntentId ?? createId("pi_demo"),
  };
}

export function markPaymentRequiresAction(paymentId: string, failureReason: string) {
  const payment = getStore().payments.find((entry) => entry.id === paymentId);
  if (!payment) {
    throw new Error("Payment not found.");
  }

  payment.status = "requires_action";
  payment.lastError = failureReason;
  payment.updatedAt = nowIso();
  return payment;
}

export function refundPayment(bookingId: string, amount?: number) {
  const payment = getPaymentByBookingId(bookingId);
  if (!payment) {
    throw new Error("Payment not found.");
  }

  payment.status = "refunded";
  payment.refundAmount = amount ?? payment.amount;
  payment.updatedAt = nowIso();
  return payment;
}
