import { beforeEach, describe, expect, it } from "vitest";

import { getStore, resetStore } from "@/lib/data/demo-store";
import { expireOpenOffers, acceptOffer, createBooking, quoteBooking } from "@/lib/services/bookings";

describe("booking services", () => {
  beforeEach(() => {
    resetStore();
  });

  it("quotes a Charlotte launch-market trip without review triggers", async () => {
    const quote = await quoteBooking({
      tripType: "one_way",
      pickupLocation: {
        addressLine: "500 S Tryon St",
        city: "Charlotte",
        state: "NC",
        postalCode: "28202"
      },
      dropoffLocation: {
        addressLine: "5501 Josh Birmingham Pkwy",
        city: "Charlotte",
        state: "NC",
        postalCode: "28208"
      },
      stops: [],
      pickupDateTimeLocal: futureDate(30),
      passengers: 10,
      luggageCount: 6,
      contactName: "Morgan Lee",
      contactEmail: "planner@acmeevents.com",
      contactPhone: "704-555-0110"
    });

    expect(quote.coverageStatus).toBe("launch_market");
    expect(quote.reviewTriggers).toHaveLength(0);
    expect(quote.eligibleOperatorIds.length).toBeGreaterThan(0);
  });

  it("routes uncovered trips into manual review", async () => {
    const booking = await createBooking({
      tripType: "hourly",
      pickupLocation: {
        addressLine: "401 Biscayne Blvd",
        city: "Miami",
        state: "FL",
        postalCode: "33132"
      },
      dropoffLocation: {
        addressLine: "100 Chopin Plaza",
        city: "Miami",
        state: "FL",
        postalCode: "33131"
      },
      stops: [],
      pickupDateTimeLocal: futureDate(50),
      passengers: 18,
      luggageCount: 4,
      contactName: "Dana Rivers",
      contactEmail: "dana@eventco.com",
      contactPhone: "786-555-0188"
    });

    expect(booking.status).toBe("manual_review_pending");
    expect(booking.reviewTriggers).toContain("coverage_gap");
    expect(booking.reviewTriggers).toContain("hourly_trip");
  });

  it("expires operator offers back to admin", () => {
    const store = getStore();
    const booking = store.bookings.find((entry) => entry.id === "booking_offer_demo");
    expect(booking).toBeTruthy();
    if (!booking) return;
    booking.offerExpiresAt = new Date(Date.now() - 60_000).toISOString();

    expireOpenOffers();

    expect(booking.status).toBe("offer_expired");
  });

  it("enforces first acceptance wins", async () => {
    const store = getStore();
    const accepted = await acceptOffer("offer_pending_demo_1", {
      id: "user_operator_1",
      role: "operator",
      email: "ops@charlottemobility.com",
      name: "Charlotte Mobility Ops",
      operatorId: "operator_1"
    });

    expect(accepted.status).toMatch(/confirmed|payment_action_required/);

    await expect(
      acceptOffer("offer_pending_demo_2", {
        id: "user_operator_2",
        role: "operator",
        email: "dispatch@queencitycharter.com",
        name: "Queen City Charter Dispatch",
        operatorId: "operator_2"
      })
    ).rejects.toThrow("This offer is no longer available.");
  });

  it("moves large or flagged captures into payment_action_required", async () => {
    const booking = await createBooking({
      tripType: "one_way",
      pickupLocation: {
        addressLine: "1 NASCAR Plaza",
        city: "Charlotte",
        state: "NC",
        postalCode: "28202"
      },
      dropoffLocation: {
        addressLine: "5501 Josh Birmingham Pkwy",
        city: "Charlotte",
        state: "NC",
        postalCode: "28208"
      },
      stops: [],
      pickupDateTimeLocal: futureDate(36),
      passengers: 15,
      luggageCount: 8,
      contactName: "Action Required",
      contactEmail: "action-required@example.com",
      contactPhone: "704-555-9999"
    });

    const store = getStore();
    const offer = store.offers.find((entry) => entry.bookingId === booking.id);
    expect(offer).toBeTruthy();
    if (!offer) return;

    const result = await acceptOffer(offer.id, {
      id: "user_operator_1",
      role: "operator",
      email: "ops@charlottemobility.com",
      name: "Charlotte Mobility Ops",
      operatorId: "operator_1"
    });

    expect(result.status).toBe("payment_action_required");
    expect(result.paymentRecoveryToken).toBeTruthy();
  });
});

function futureDate(hours: number) {
  const future = new Date(Date.now() + hours * 60 * 60 * 1000);
  const offset = future.getTimezoneOffset() * 60_000;
  return new Date(future.getTime() - offset).toISOString().slice(0, 16);
}
