import { getRouteEstimate } from "@/lib/adapters/maps";
import { createId, createReference, getStore } from "@/lib/data/demo-store";
import { localDateTimeToUtcIso } from "@/lib/time";
import { capturePayment, getPaymentByBookingId, refundPayment } from "@/lib/services/payment";
import { createPayoutForBooking } from "@/lib/services/payouts";
import { buildQuote, getFeasibleVehicleCategories, getPricingRuleForCategory, getRecommendedVehicle, getServiceFee } from "@/lib/services/pricing";
import { createQuote, listQuotesForBooking } from "@/lib/services/quotes";
import { sendNotification } from "@/lib/services/notifications";
import type {
  AdminDashboardMetrics,
  AdminReviewInput,
  Booking,
  BookingWithRelations,
  DashboardMetrics,
  Payment,
  PriceOverrideInput,
  Profile,
  QuoteResult,
  SessionUser,
  TripRequestInput,
  VehicleCategory,
  VehicleChoice,
} from "@/lib/types";
import { tripRequestSchema } from "@/lib/validation";
import { nowIso } from "@/lib/utils";

function getProfile(profileId: string) {
  return getStore().profiles.find((profile) => profile.id === profileId) ?? null;
}

function ensureCustomerProfile(input: TripRequestInput) {
  const store = getStore();
  const existing = store.profiles.find((profile) => profile.email.toLowerCase() === input.contactEmail.toLowerCase());
  if (existing) {
    return existing;
  }

  const profile: Profile = {
    id: createId("profile"),
    role: "customer",
    fullName: input.contactName,
    email: input.contactEmail,
    phone: input.contactPhone,
    status: "active",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  store.profiles.unshift(profile);

  if (input.createAccount && input.password) {
    store.authAccounts.unshift({
      id: createId("auth"),
      profileId: profile.id,
      email: profile.email,
      password: input.password,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  }

  return profile;
}

function getBookingAmount(booking: Booking) {
  return booking.finalAmount ?? booking.quotedAmount ?? 0;
}

export async function quoteBooking(input: TripRequestInput): Promise<QuoteResult> {
  const values = tripRequestSchema.parse(input);
  const route = await getRouteEstimate(values);
  const recommendedVehicle = getRecommendedVehicle(values.passengers);

  const vehicleChoices: VehicleChoice[] = getFeasibleVehicleCategories(values.passengers).map((category) => {
    const pricingRule = getPricingRuleForCategory(category);
    const price = buildQuote({ input: values, pricingRule, distanceMiles: route.distanceMiles });

    return {
      category,
      amount: price.amount,
      badge: category === recommendedVehicle ? "Best option" : category === "suv" ? "Budget-friendly" : "More room",
      reason:
        category === "suv"
          ? "Best fit for smaller groups."
          : category === "sprinter"
            ? "Balanced comfort and flexibility."
            : "Best when the full group should stay together.",
    };
  });

  const selectedCategory =
    values.selectedVehicleCategory && vehicleChoices.some((choice) => choice.category === values.selectedVehicleCategory)
      ? values.selectedVehicleCategory
      : recommendedVehicle;

  const rule = getPricingRuleForCategory(selectedCategory);
  const price = buildQuote({ input: values, pricingRule: rule, distanceMiles: route.distanceMiles });

  return {
    recommendedVehicle: selectedCategory,
    amount: price.amount,
    baseFare: price.baseFare,
    perMileCharge: price.perMileCharge,
    serviceFee: getServiceFee(),
    minimumApplied: price.minimumApplied,
    route,
    notes: price.notes,
    vehicleChoices,
  };
}

export async function createBooking(input: TripRequestInput) {
  return createBookingRequest(input);
}

export async function createBookingRequest(input: TripRequestInput) {
  const values = tripRequestSchema.parse(input);
  const customer = ensureCustomerProfile(values);
  const quote = await quoteBooking(values);
  const store = getStore();

  const booking: Booking = {
    id: createId("booking"),
    reference: createReference(),
    customerProfileId: customer.id,
    status: "pending",
    tripType: values.tripType,
    tripIntent: values.tripIntent,
    pickupLocation: quote.route.pickup,
    dropoffLocation: quote.route.dropoff,
    distanceMiles: values.distanceMiles ?? quote.route.distanceMiles,
    driveTimeMinutes: values.driveTimeMinutes ?? quote.route.estimatedDurationMinutes,
    formattedRouteText:
      values.formattedRouteText ?? `${quote.route.pickup.label} to ${quote.route.dropoff.label}`,
    pickupLat: values.pickupLat ?? quote.route.pickup.latitude,
    pickupLng: values.pickupLng ?? quote.route.pickup.longitude,
    dropoffLat: values.dropoffLat ?? quote.route.dropoff.latitude,
    dropoffLng: values.dropoffLng ?? quote.route.dropoff.longitude,
    pickupDateTimeLocal: values.pickupDateTimeLocal,
    pickupDateTimeUtc: localDateTimeToUtcIso(values.pickupDateTimeLocal, quote.route.pickup.timezone),
    returnDateTimeLocal: values.returnDateTimeLocal,
    returnDateTimeUtc: values.returnDateTimeLocal
      ? localDateTimeToUtcIso(values.returnDateTimeLocal, quote.route.pickup.timezone)
      : undefined,
    passengers: values.passengers,
    luggageCount: values.luggageCount,
    requestedVehicleCategory: values.selectedVehicleCategory ?? quote.recommendedVehicle,
    notes: values.notes,
    conciergeTrip: values.conciergeTrip,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  store.bookings.unshift(booking);
  store.bookingPassengers.unshift({
    id: createId("booking_passenger"),
    bookingId: booking.id,
    fullName: values.contactName,
    email: values.contactEmail,
    phone: values.contactPhone,
    createdAt: nowIso(),
  });
  quote.route.stops.forEach((stop) => {
    store.bookingStops.unshift({
      id: createId("booking_stop"),
      bookingId: booking.id,
      order: stop.order,
      location: stop.location,
      createdAt: nowIso(),
    });
  });

  await sendNotification({
    profileId: customer.id,
    bookingId: booking.id,
    type: "booking_created",
    title: "Trip request received",
    message: "We received your GroupRide request and our team will prepare a quote shortly.",
    recipient: customer.email,
    channel: "email",
  });

  return { booking, customer, quotePreview: quote };
}

export function getBookingById(bookingId: string): BookingWithRelations | null {
  const store = getStore();
  const booking = store.bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    return null;
  }

  const operator = booking.operatorId ? store.operators.find((entry) => entry.id === booking.operatorId) ?? null : null;
  return {
    booking,
    customer: getProfile(booking.customerProfileId),
    operator,
    vehicle: booking.vehicleId ? store.vehicles.find((entry) => entry.id === booking.vehicleId) ?? null : null,
    driver: booking.driverId ? store.drivers.find((entry) => entry.id === booking.driverId) ?? null : null,
    quotes: listQuotesForBooking(booking.id),
    payment: getPaymentByBookingId(booking.id),
    payout: store.payouts.find((entry) => entry.bookingId === booking.id) ?? null,
    passengers: store.bookingPassengers.filter((entry) => entry.bookingId === booking.id),
    stops: store.bookingStops.filter((entry) => entry.bookingId === booking.id).sort((a, b) => a.order - b.order),
  };
}

export function listAdminBookings() {
  return [...getStore().bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listCustomerBookings(profileId: string) {
  return listAdminBookings().filter((booking) => booking.customerProfileId === profileId);
}

export function listOperatorBookings(operatorId: string) {
  return listAdminBookings().filter((booking) => booking.operatorId === operatorId);
}

export function listOperatorOpportunities(operatorId: string) {
  const store = getStore();
  const operatorVehicleCategories = new Set(
    store.vehicles.filter((vehicle) => vehicle.operatorId === operatorId && vehicle.status === "active").map((vehicle) => vehicle.category),
  );

  return listAdminBookings().filter(
    (booking) =>
      (!booking.operatorId && booking.status === "pending" && booking.requestedVehicleCategory && operatorVehicleCategories.has(booking.requestedVehicleCategory)) ||
      booking.operatorId === operatorId,
  );
}

export async function overrideBookingPrice(bookingId: string, input: PriceOverrideInput, actor: SessionUser) {
  const booking = getStore().bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  const quote = await createQuote({
    bookingId: booking.id,
    actor,
    operatorId: booking.operatorId,
    vehicleCategory: booking.requestedVehicleCategory ?? "sprinter",
    amount: input.amount,
    notes: input.reason,
  });

  return quote;
}

export async function reviewBooking(bookingId: string, input: AdminReviewInput, actor: SessionUser) {
  const booking = getStore().bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (input.action === "cancel_booking") {
    return cancelBooking(bookingId, actor.email);
  }

  if (input.action === "mark_confirmed") {
    booking.status = "confirmed";
    booking.updatedAt = nowIso();
    return booking;
  }

  const amount = booking.quotedAmount ?? 425;
  await createQuote({
    bookingId,
    actor,
    operatorId: booking.operatorId,
    vehicleCategory: booking.requestedVehicleCategory ?? "sprinter",
    amount,
    notes: "Admin-requested quote draft.",
  });
  return booking;
}

export async function confirmBookingPayment(bookingId: string) {
  const booking = getStore().bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  const payment = getPaymentByBookingId(bookingId);
  if (!payment) {
    throw new Error("Payment not found.");
  }

  const paymentResult = await capturePayment(payment.id);
  booking.paymentStatus = paymentResult.paymentStatus;
  booking.status = "confirmed";
  booking.updatedAt = nowIso();

  const customer = getProfile(booking.customerProfileId);
  if (customer) {
    await sendNotification({
      profileId: customer.id,
      bookingId: booking.id,
      type: "payment_succeeded",
      title: "Booking confirmed",
      message: "Your payment succeeded and your booking is now confirmed.",
      recipient: customer.email,
      channel: "email",
    });
  }

  return { booking, payment: payment as Payment };
}

export function assignOperatorToBooking(input: { bookingId: string; operatorId: string; vehicleId?: string; driverId?: string }) {
  const booking = getStore().bookings.find((entry) => entry.id === input.bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  booking.operatorId = input.operatorId;
  booking.vehicleId = input.vehicleId;
  booking.driverId = input.driverId;
  booking.status = "assigned";
  booking.updatedAt = nowIso();
  return booking;
}

export function markBookingInProgress(bookingId: string) {
  const booking = getStore().bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  booking.status = "in_progress";
  booking.updatedAt = nowIso();
  return booking;
}

export function markBookingCompleted(bookingId: string) {
  const booking = getStore().bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  booking.status = "completed";
  booking.completedAt = nowIso();
  booking.updatedAt = nowIso();

  if (booking.operatorId && getBookingAmount(booking) > 0) {
    createPayoutForBooking({
      bookingId: booking.id,
      operatorId: booking.operatorId,
      grossAmount: getBookingAmount(booking),
      platformFeeAmount: Math.round(getBookingAmount(booking) * 0.1),
    });
  }

  return booking;
}

export async function cancelBooking(bookingId: string, actor = "customer") {
  const booking = getStore().bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.paymentStatus === "succeeded") {
    refundPayment(booking.id);
  }

  booking.status = "cancelled";
  booking.cancelledAt = nowIso();
  booking.updatedAt = nowIso();

  const customer = getProfile(booking.customerProfileId);
  if (customer) {
    await sendNotification({
      profileId: customer.id,
      bookingId: booking.id,
      type: "booking_status_updated",
      title: "Booking cancelled",
      message: `Booking ${booking.reference} was cancelled by ${actor}.`,
      recipient: customer.email,
      channel: "email",
    });
  }

  return booking;
}

export function listPricingRules() {
  return [...getStore().pricingRules];
}

export function updatePricingRule(
  ruleId: string,
  updates: Partial<{
    baseFare: number;
    ratePerMile: number;
    minimumFare: number;
    hourlyRate: number;
    minimumHours: number;
  }>,
) {
  const rule = getStore().pricingRules.find((entry) => entry.id === ruleId);
  if (!rule) {
    throw new Error("Pricing rule not found.");
  }

  Object.assign(rule, updates, { updatedAt: nowIso() });
  return rule;
}

export function getDashboardMetrics(): DashboardMetrics {
  const bookings = listAdminBookings();
  return {
    totalRequests: bookings.length,
    pendingReview: bookings.filter((booking) => ["pending", "quoted", "awaiting_payment"].includes(booking.status)).length,
    openOffers: bookings.filter((booking) => booking.status === "quoted").length,
    confirmedTrips: bookings.filter((booking) => ["confirmed", "assigned", "in_progress", "completed"].includes(booking.status)).length,
    grossBookedRevenue: bookings
      .filter((booking) => booking.status !== "cancelled")
      .reduce((sum, booking) => sum + getBookingAmount(booking), 0),
  };
}

export function getAdminDashboardMetrics(): AdminDashboardMetrics {
  const bookings = listAdminBookings();
  const store = getStore();
  return {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((booking) => ["pending", "quoted", "awaiting_payment"].includes(booking.status)).length,
    openQuotes: store.quotes.filter((quote) => quote.status === "sent").length,
    confirmedRevenue: bookings
      .filter((booking) => ["confirmed", "assigned", "in_progress", "completed"].includes(booking.status))
      .reduce((sum, booking) => sum + getBookingAmount(booking), 0),
    activeOperators: store.operators.filter((operator) => operator.status === "active").length,
  };
}
