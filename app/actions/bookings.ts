"use server";

import { createBookingRequest, markBookingCompleted, markBookingInProgress } from "@/lib/services/bookings";
import { acceptQuote, createQuote } from "@/lib/services/quotes";
import type { SessionUser, TripRequestInput, VehicleCategory } from "@/lib/types";

export async function createBookingRequestAction(input: TripRequestInput) {
  return createBookingRequest(input);
}

export async function createQuoteAction(input: {
  bookingId: string;
  actor: SessionUser;
  operatorId?: string;
  vehicleCategory: VehicleCategory;
  amount: number;
  notes?: string;
}) {
  return createQuote(input);
}

export async function acceptQuoteAction(input: { quoteId: string; customerProfileId: string }) {
  return acceptQuote(input);
}

export async function markTripInProgressAction(bookingId: string) {
  return markBookingInProgress(bookingId);
}

export async function markTripCompletedAction(bookingId: string) {
  return markBookingCompleted(bookingId);
}
