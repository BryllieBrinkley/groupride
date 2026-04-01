import { createId, getStore } from "@/lib/data/demo-store";
import { createPaymentIntent } from "@/lib/services/payment";
import { sendNotification } from "@/lib/services/notifications";
import type { Quote, SessionUser, VehicleCategory } from "@/lib/types";
import { nowIso } from "@/lib/utils";

export function listQuotesForBooking(bookingId: string) {
  return getStore().quotes.filter((quote) => quote.bookingId === bookingId);
}

export function getQuoteById(quoteId: string) {
  return getStore().quotes.find((quote) => quote.id === quoteId) ?? null;
}

export async function createQuote(input: {
  bookingId: string;
  actor: SessionUser;
  operatorId?: string;
  vehicleCategory: VehicleCategory;
  vehicleId?: string;
  amount: number;
  notes?: string;
}) {
  const store = getStore();
  const booking = store.bookings.find((entry) => entry.id === input.bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  const quote: Quote = {
    id: createId("quote"),
    bookingId: booking.id,
    operatorId: input.operatorId,
    createdByProfileId: input.actor.profileId,
    source: input.actor.role === "admin" ? "admin" : "operator",
    vehicleCategory: input.vehicleCategory,
    vehicleId: input.vehicleId,
    amount: Math.round(input.amount),
    serviceFee: 25,
    notes: input.notes,
    status: "sent",
    expiresAt: nowIso(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  booking.status = "quoted";
  booking.operatorId = input.operatorId ?? booking.operatorId;
  booking.quotedAmount = quote.amount;
  booking.updatedAt = nowIso();
  store.quotes.unshift(quote);

  const customer = store.profiles.find((profile) => profile.id === booking.customerProfileId);
  if (customer) {
    await sendNotification({
      profileId: customer.id,
      bookingId: booking.id,
      quoteId: quote.id,
      type: "quote_created",
      title: "Your quote is ready",
      message: "A new GroupRide quote has been prepared for your trip.",
      recipient: customer.email,
      channel: "email",
    });
  }

  return quote;
}

export async function acceptQuote(input: { quoteId: string; customerProfileId: string }) {
  const store = getStore();
  const quote = store.quotes.find((entry) => entry.id === input.quoteId);
  if (!quote) {
    throw new Error("Quote not found.");
  }

  const booking = store.bookings.find((entry) => entry.id === quote.bookingId);
  if (!booking || booking.customerProfileId !== input.customerProfileId) {
    throw new Error("Booking not found.");
  }

  quote.status = "accepted";
  quote.acceptedAt = nowIso();
  quote.updatedAt = nowIso();

  booking.acceptedQuoteId = quote.id;
  booking.status = "awaiting_payment";
  booking.finalAmount = quote.amount;
  booking.updatedAt = nowIso();

  const payment = await createPaymentIntent({ booking, quote });
  booking.paymentIntentId = payment.paymentIntentId;
  booking.paymentStatus = payment.status;
  booking.updatedAt = nowIso();

  return { booking, quote, payment };
}

export function rejectQuote(quoteId: string) {
  const quote = getQuoteById(quoteId);
  if (!quote) {
    throw new Error("Quote not found.");
  }

  quote.status = "rejected";
  quote.updatedAt = nowIso();
  return quote;
}
