import { getStore } from "@/lib/data/demo-store";
import { getRouteEstimate } from "@/lib/adapters/maps";
import { localDateTimeToUtcIso, hoursUntilLocal } from "@/lib/time";
import { sendNotification } from "@/lib/services/notifications";
import { matchOperatorsForRequest } from "@/lib/services/matching";
import {
  buildQuote,
  determineReviewTriggers,
  getFeasibleVehicleCategories,
  getRecommendedVehicle,
  getServiceFee
} from "@/lib/services/pricing";
import { capturePayment, refundPayment, savePaymentMethod } from "@/lib/services/payment";
import type {
  AdminReviewInput,
  Booking,
  BookingOffer,
  BookingStatus,
  DashboardMetrics,
  PriceOverrideInput,
  QuoteResult,
  ReviewTrigger,
  SessionUser,
  TripRequestInput,
  VehicleChoice,
  VehicleCategory
} from "@/lib/types";
import { tripRequestSchema } from "@/lib/validation";
import { addHours, hoursUntil, makeId, nowIso } from "@/lib/utils";

function logAudit(actor: string, action: string, details: string, bookingId?: string) {
  const store = getStore();
  store.audits.unshift({
    id: makeId("audit"),
    actor,
    action,
    details,
    bookingId,
    createdAt: nowIso()
  });
}

function getCustomerProfile(email: string, name: string, phone: string) {
  const store = getStore();
  let profile = store.customers.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!profile) {
    profile = {
      id: makeId("customer"),
      name,
      email,
      phone
    };
    store.customers.unshift(profile);
  }
  return profile;
}

function maybeCreateCustomerUser(input: TripRequestInput, customerProfileId: string) {
  const store = getStore();
  if (!input.createAccount || !input.password) {
    return undefined;
  }

  const existing = store.users.find((entry) => entry.email.toLowerCase() === input.contactEmail.toLowerCase());
  if (existing) {
    return existing.id;
  }

  const userId = makeId("user");
  store.users.unshift({
    id: userId,
    role: "customer",
    email: input.contactEmail,
    name: input.contactName,
    phone: input.contactPhone,
    password: input.password,
    customerId: customerProfileId
  });
  return userId;
}

export async function quoteBooking(input: TripRequestInput): Promise<QuoteResult> {
  const values = tripRequestSchema.parse(input);
  const route = await getRouteEstimate(values);
  const store = getStore();
  const recommendedVehicle = getRecommendedVehicle(values.passengers);

  const leadHours = hoursUntilLocal(values.pickupDateTimeLocal, route.pickup.timezone);
  if (leadHours < 6) {
    throw new Error("Trips must be scheduled at least 6 hours in advance.");
  }

  const vehicleChoices = getFeasibleVehicleCategories(values.passengers).map((category) =>
    buildVehicleChoice({
      category,
      input: values,
      routeDistanceMiles: route.distanceMiles,
      pickupLocation: route.pickup
    })
  );

  const selectedVehicleCategory =
    values.selectedVehicleCategory && vehicleChoices.some((choice) => choice.category === values.selectedVehicleCategory)
      ? values.selectedVehicleCategory
      : recommendedVehicle;

  const selectedChoice = vehicleChoices.find((choice) => choice.category === selectedVehicleCategory) ?? vehicleChoices[0];

  const notes = [];
  if (selectedChoice.coverageStatus === "outside_coverage") {
    notes.push("We can still take this request, but our team will review it before it moves forward.");
  } else if (selectedChoice.eligibleOperatorIds.length === 0) {
    notes.push("We found coverage nearby, but our team needs to source the right ride before confirming.");
  } else if (selectedChoice.isLaunchMarket) {
    notes.push("This trip is inside our live Charlotte coverage and can route to operators right away.");
  } else {
    notes.push("This trip is outside the launch city but covered by live operator supply.");
  }
  if (selectedChoice.reviewTriggers.length > 0) {
    notes.push("If anything needs extra review, our team handles it for you after you send the request.");
  }

  return {
    recommendedVehicle: selectedChoice.category,
    amount: selectedChoice.amount,
    baseFare: buildQuote({
      input: values,
      pricingRule: store.pricingRules.find((entry) => entry.category === selectedChoice.category)!,
      distanceMiles: route.distanceMiles
    }).baseFare,
    perMileCharge: buildQuote({
      input: values,
      pricingRule: store.pricingRules.find((entry) => entry.category === selectedChoice.category)!,
      distanceMiles: route.distanceMiles
    }).perMileCharge,
    serviceFee: getServiceFee(),
    minimumApplied: buildQuote({
      input: values,
      pricingRule: store.pricingRules.find((entry) => entry.category === selectedChoice.category)!,
      distanceMiles: route.distanceMiles
    }).minimumApplied,
    route,
    reviewTriggers: selectedChoice.reviewTriggers,
    coverageStatus: selectedChoice.coverageStatus,
    matchedOperatorIds: selectedChoice.matchedOperatorIds,
    eligibleOperatorIds: selectedChoice.eligibleOperatorIds,
    isLaunchMarket: selectedChoice.isLaunchMarket,
    notes,
    vehicleChoices
  };
}

function computeInitialStatus(quote: QuoteResult, input: TripRequestInput): BookingStatus {
  if (input.conciergeTrip) {
    return "manual_review_pending";
  }
  if (quote.eligibleOperatorIds.length === 0 && quote.coverageStatus !== "outside_coverage") {
    return "no_operator_available";
  }
  if (quote.reviewTriggers.length > 0) {
    return "manual_review_pending";
  }
  if (quote.eligibleOperatorIds.length === 0) {
    return "manual_review_pending";
  }
  return "operator_offer_open";
}

export async function createBooking(input: TripRequestInput) {
  const quote = await quoteBooking(input);
  const store = getStore();
  const customerProfile = getCustomerProfile(input.contactEmail, input.contactName, input.contactPhone);
  const customerUserId = maybeCreateCustomerUser(input, customerProfile.id);
  const createdAt = nowIso();
  const status = computeInitialStatus(quote, input);

  const booking: Booking = {
    id: makeId("booking"),
    channel: "web",
    customerProfileId: customerProfile.id,
    customerUserId,
    tripIntent: input.tripIntent,
    planningHelp: input.planningHelp,
    conciergeTrip: input.conciergeTrip,
    arrivingByFlight: input.arrivingByFlight,
    flightNumber: input.flightNumber,
    flightArrivalTime: input.flightArrivalTime,
    multiDay: input.multiDay,
    needsReturnTrip: input.needsReturnTrip,
    tripType: input.tripType,
    pickupLocation: quote.route.pickup,
    dropoffLocation: quote.route.dropoff,
    stops: quote.route.stops,
    pickupDateTimeUtc: localDateTimeToUtcIso(input.pickupDateTimeLocal, quote.route.pickup.timezone),
    pickupDateTimeLocal: input.pickupDateTimeLocal,
    returnDateTimeUtc: input.returnDateTimeLocal
      ? localDateTimeToUtcIso(input.returnDateTimeLocal, quote.route.pickup.timezone)
      : undefined,
    returnDateTimeLocal: input.returnDateTimeLocal,
    pickupTimezone: quote.route.pickup.timezone,
    passengers: input.passengers,
    luggageCount: input.luggageCount,
    notes: input.notes,
    vehicleCategory: input.selectedVehicleCategory ?? quote.recommendedVehicle,
    priceLockedAmount: quote.amount,
    activeAmount: quote.amount,
    distanceMiles: quote.route.distanceMiles,
    estimatedDurationMinutes: quote.route.estimatedDurationMinutes,
    serviceFee: getServiceFee(),
    reviewTriggers: quote.reviewTriggers,
    coverageStatus: quote.coverageStatus,
    status,
    paymentStatus: "payment_method_saved",
    matchedOperatorIds: quote.matchedOperatorIds,
    eligibleOperatorIds: quote.eligibleOperatorIds,
    offerExpiresAt: status === "operator_offer_open" ? addHours(createdAt, 2) : undefined,
    createdAt,
    updatedAt: createdAt
  };

  store.bookings.unshift(booking);
  savePaymentMethod(booking, input.paymentMethodToken);
  logAudit("customer", "booking_requested", "Booking request created.", booking.id);

  await sendNotification({
    bookingId: booking.id,
    recipient: input.contactEmail,
    subject: "We received your GroupRide request",
    type: "request_received"
  });

  if (status === "operator_offer_open") {
    createOffers(booking);
  } else if (status === "no_operator_available") {
    booking.reviewTriggers = Array.from(new Set<ReviewTrigger>([...booking.reviewTriggers, "no_operator_available"]));
    await sendNotification({
      bookingId: booking.id,
      recipient: input.contactEmail,
      subject: "Your request needs operator review",
      type: "manual_review_received"
    });
    logAudit("system", "booking_routed_no_supply", "No eligible operators were available.", booking.id);
  } else {
    await sendNotification({
      bookingId: booking.id,
      recipient: input.contactEmail,
      subject: "Your request is in ops review",
      type: "manual_review_received"
    });
  }

  return booking;
}

function createOffers(booking: Booking) {
  const store = getStore();
  const offers: BookingOffer[] = booking.eligibleOperatorIds.map((operatorId) => ({
    id: makeId("offer"),
    bookingId: booking.id,
    operatorId,
    vehicleCategory: booking.vehicleCategory,
    status: "pending",
    createdAt: nowIso(),
    expiresAt: booking.offerExpiresAt ?? addHours(nowIso(), 2)
  }));

  store.offers.unshift(...offers);
  offers.forEach((offer) => {
    const operatorUser = store.users.find((entry) => entry.operatorId === offer.operatorId);
    if (operatorUser) {
      void sendNotification({
        bookingId: booking.id,
        recipient: operatorUser.email,
        subject: "New GroupRide operator offer",
        type: "operator_offer"
      });
    }
  });
}

export function expireOpenOffers() {
  const store = getStore();
  const now = new Date();

  store.bookings.forEach((booking) => {
    if (booking.status !== "operator_offer_open" || !booking.offerExpiresAt) {
      return;
    }

    if (new Date(booking.offerExpiresAt) <= now) {
      booking.status = "offer_expired";
      booking.reviewTriggers = Array.from(new Set<ReviewTrigger>([...booking.reviewTriggers, "offer_expired"]));
      booking.updatedAt = nowIso();
      store.offers
        .filter((offer) => offer.bookingId === booking.id && offer.status === "pending")
        .forEach((offer) => {
          offer.status = "expired";
          offer.actedAt = nowIso();
        });
      logAudit("system", "offer_expired", "Operator offer window expired.", booking.id);
    }
  });
}

export function getBookingById(bookingId: string) {
  expireOpenOffers();
  const store = getStore();
  const booking = store.bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    return null;
  }

  return {
    booking,
    customer: store.customers.find((entry) => entry.id === booking.customerProfileId) ?? null,
    offers: store.offers.filter((entry) => entry.bookingId === booking.id),
    paymentAttempts: store.paymentAttempts.filter((entry) => entry.bookingId === booking.id)
  };
}

export async function cancelBooking(bookingId: string, actor = "customer") {
  const store = getStore();
  const booking = store.bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (["cancelled", "refunded", "closed_unfulfilled"].includes(booking.status)) {
    return booking;
  }

  const hoursBeforePickup = hoursUntil(booking.pickupDateTimeUtc);
  let refundAmount = 0;
  if (booking.status === "confirmed") {
    if (hoursBeforePickup >= 48) {
      refundAmount = booking.activeAmount;
    } else if (hoursBeforePickup >= 24) {
      refundAmount = Math.round(booking.activeAmount * 0.5);
    }
  }

  if (refundAmount > 0) {
    refundPayment(booking, refundAmount);
    booking.status = "refunded";
    booking.paymentStatus = "refunded";
  } else {
    booking.status = "cancelled";
  }

  booking.updatedAt = nowIso();
  logAudit(actor, "booking_cancelled", `Booking cancelled. Refund amount: ${refundAmount}.`, booking.id);
  await sendNotification({
    bookingId: booking.id,
    recipient: getCustomerEmail(booking.customerProfileId),
    subject: refundAmount > 0 ? "Your GroupRide refund is on the way" : "Your GroupRide booking has been cancelled",
    type: refundAmount > 0 ? "refund_processed" : "booking_cancelled"
  });
  return booking;
}

export async function acceptOffer(offerId: string, actor: SessionUser) {
  const store = getStore();
  const offer = store.offers.find((entry) => entry.id === offerId);
  if (!offer) {
    throw new Error("Offer not found.");
  }
  const booking = store.bookings.find((entry) => entry.id === offer.bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }
  expireOpenOffers();

  if (booking.status !== "operator_offer_open" || offer.status !== "pending") {
    throw new Error("This offer is no longer available.");
  }
  if (actor.operatorId !== offer.operatorId) {
    throw new Error("You can only accept offers for your operator account.");
  }

  // This synchronous state transition acts as the single-winner acceptance gate in demo mode.
  booking.status = "operator_accepted";
  booking.selectedOperatorId = offer.operatorId;
  booking.selectedOfferId = offer.id;
  booking.updatedAt = nowIso();
  offer.status = "accepted";
  offer.actedAt = nowIso();

  store.offers
    .filter((entry) => entry.bookingId === booking.id && entry.id !== offer.id && entry.status === "pending")
    .forEach((entry) => {
      entry.status = "closed";
      entry.actedAt = nowIso();
    });

  logAudit(actor.email, "offer_accepted", "Operator accepted the booking request.", booking.id);
  await sendNotification({
    bookingId: booking.id,
    recipient: getCustomerEmail(booking.customerProfileId),
    subject: "An operator accepted your request",
    type: "operator_accepted"
  });

  booking.status = "payment_processing";
  booking.paymentStatus = "processing";
  const payment = await capturePayment(booking);

  if (payment.paymentStatus === "paid") {
    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    booking.paymentRecoveryToken = undefined;
    await sendNotification({
      bookingId: booking.id,
      recipient: getCustomerEmail(booking.customerProfileId),
      subject: "Your GroupRide booking is confirmed",
      type: "booking_confirmed"
    });
  } else {
    booking.status = "payment_action_required";
    booking.paymentStatus = "requires_action";
    booking.paymentRecoveryToken = payment.recoveryToken;
    await sendNotification({
      bookingId: booking.id,
      recipient: getCustomerEmail(booking.customerProfileId),
      subject: "Action needed to complete your GroupRide payment",
      type: "payment_action_required"
    });
  }

  booking.updatedAt = nowIso();
  return booking;
}

export async function declineOffer(offerId: string, actor: SessionUser) {
  const store = getStore();
  const offer = store.offers.find((entry) => entry.id === offerId);
  if (!offer) {
    throw new Error("Offer not found.");
  }
  if (actor.operatorId !== offer.operatorId) {
    throw new Error("You can only decline offers for your operator account.");
  }
  offer.status = "declined";
  offer.actedAt = nowIso();

  const booking = store.bookings.find((entry) => entry.id === offer.bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  const openOffers = store.offers.filter((entry) => entry.bookingId === booking.id && entry.status === "pending");
  if (openOffers.length === 0) {
    booking.status = "no_operator_available";
    booking.reviewTriggers = Array.from(new Set<ReviewTrigger>([...booking.reviewTriggers, "no_operator_available"]));
    booking.updatedAt = nowIso();
    logAudit(actor.email, "offer_declined", "All operator offers were declined.", booking.id);
  }

  return booking;
}

export async function overrideBookingPrice(bookingId: string, input: PriceOverrideInput, actor: SessionUser) {
  const store = getStore();
  const booking = store.bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  booking.activeAmount = Math.round(input.amount);
  booking.status = "customer_approval_required";
  booking.priceOverrideReason = input.reason;
  booking.approvalToken = makeId("approve");
  booking.updatedAt = nowIso();

  logAudit(actor.email, "price_override", `Price override set to ${input.amount}.`, booking.id);
  await sendNotification({
    bookingId: booking.id,
    recipient: getCustomerEmail(booking.customerProfileId),
    subject: "Please approve your updated GroupRide quote",
    type: "revised_quote_needed"
  });

  return booking;
}

export async function approvePriceOverride(bookingId: string, token: string) {
  const store = getStore();
  const booking = store.bookings.find((entry) => entry.id === bookingId);
  if (!booking || booking.approvalToken !== token) {
    throw new Error("Invalid approval token.");
  }

  booking.approvalToken = undefined;
  booking.status = "manual_review_pending";
  booking.updatedAt = nowIso();
  logAudit("customer", "price_override_approved", "Customer approved revised quote.", booking.id);
  return booking;
}

export async function recoverPayment(bookingId: string, token: string) {
  const store = getStore();
  const booking = store.bookings.find((entry) => entry.id === bookingId);
  if (!booking || booking.paymentRecoveryToken !== token) {
    throw new Error("Invalid recovery token.");
  }

  booking.status = "payment_processing";
  booking.paymentStatus = "processing";
  booking.updatedAt = nowIso();
  const payment = await capturePayment(booking);
  if (payment.paymentStatus === "paid") {
    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    booking.paymentRecoveryToken = undefined;
    await sendNotification({
      bookingId: booking.id,
      recipient: getCustomerEmail(booking.customerProfileId),
      subject: "Your GroupRide booking is confirmed",
      type: "booking_confirmed"
    });
  } else {
    booking.status = "payment_action_required";
    booking.paymentStatus = "requires_action";
    booking.paymentRecoveryToken = payment.recoveryToken;
  }

  booking.updatedAt = nowIso();
  return booking;
}

export async function reviewBooking(bookingId: string, input: AdminReviewInput, actor: SessionUser) {
  const store = getStore();
  const booking = store.bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (input.action === "close_unfulfilled") {
    booking.status = "closed_unfulfilled";
    booking.updatedAt = nowIso();
    await sendNotification({
      bookingId: booking.id,
      recipient: getCustomerEmail(booking.customerProfileId),
      subject: "Your GroupRide request could not be fulfilled",
      type: "booking_unfulfilled"
    });
  } else if (input.action === "mark_no_supply") {
    booking.status = "no_operator_available";
    booking.reviewTriggers = Array.from(new Set<ReviewTrigger>([...booking.reviewTriggers, "no_operator_available"]));
    booking.updatedAt = nowIso();
  } else {
    const matched = matchOperatorsForRequest({
      pickupLocation: booking.pickupLocation,
      vehicleCategory: booking.vehicleCategory
    });
    booking.matchedOperatorIds = matched.matchedOperatorIds;
    booking.eligibleOperatorIds = matched.eligibleOperatorIds;
    if (matched.eligibleOperatorIds.length === 0) {
      booking.status = "no_operator_available";
      booking.reviewTriggers = Array.from(new Set<ReviewTrigger>([...booking.reviewTriggers, "no_operator_available"]));
    } else {
      booking.status = "operator_offer_open";
      booking.offerExpiresAt = addHours(nowIso(), 2);
      createOffers(booking);
    }
    booking.updatedAt = nowIso();
  }

  logAudit(actor.email, "booking_review_action", input.action, booking.id);
  return booking;
}

export function listAdminBookings() {
  expireOpenOffers();
  const store = getStore();
  return [...store.bookings].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).reverse();
}

export function listOperatorOffers(operatorId: string) {
  expireOpenOffers();
  const store = getStore();
  return store.offers
    .filter((offer) => offer.operatorId === operatorId)
    .map((offer) => ({
      offer,
      booking: store.bookings.find((booking) => booking.id === offer.bookingId)
    }))
    .filter((entry) => entry.booking !== undefined);
}

export function listOperatorBookings(operatorId: string) {
  const store = getStore();
  return store.bookings.filter(
    (booking) => booking.selectedOperatorId === operatorId && ["confirmed", "payment_action_required"].includes(booking.status)
  );
}

export function listOperators() {
  const store = getStore();
  return store.operators.map((operator) => ({
    operator,
    serviceAreas: store.serviceAreas.filter((area) => area.operatorId === operator.id),
    vehicles: store.vehicles.filter((vehicle) => vehicle.operatorId === operator.id)
  }));
}

export function listPricingRules() {
  const store = getStore();
  return store.pricingRules;
}

export function listCustomerBookings(customerUserId: string) {
  const store = getStore();
  return store.bookings.filter((booking) => booking.customerUserId === customerUserId);
}

export function updatePricingRule(ruleId: string, updates: Partial<{ baseFare: number; ratePerMile: number; minimumFare: number; hourlyRate: number; minimumHours: number }>) {
  const store = getStore();
  const rule = store.pricingRules.find((entry) => entry.id === ruleId);
  if (!rule) {
    throw new Error("Pricing rule not found.");
  }
  Object.assign(rule, updates);
  return rule;
}

export function getDashboardMetrics(): DashboardMetrics {
  const store = getStore();
  expireOpenOffers();
  return {
    totalRequests: store.bookings.length,
    pendingReview: store.bookings.filter((booking) => ["manual_review_pending", "customer_approval_required", "no_operator_available", "offer_expired", "payment_action_required"].includes(booking.status)).length,
    openOffers: store.bookings.filter((booking) => booking.status === "operator_offer_open").length,
    confirmedTrips: store.bookings.filter((booking) => booking.status === "confirmed").length,
    grossBookedRevenue: store.bookings
      .filter((booking) => ["confirmed", "payment_action_required", "operator_offer_open", "manual_review_pending"].includes(booking.status))
      .reduce((sum, booking) => sum + booking.activeAmount, 0)
  };
}

function getCustomerEmail(customerProfileId: string) {
  const store = getStore();
  return store.customers.find((customer) => customer.id === customerProfileId)?.email ?? "unknown@groupride.app";
}

function buildVehicleChoice({
  category,
  input,
  routeDistanceMiles,
  pickupLocation
}: {
  category: VehicleCategory;
  input: TripRequestInput;
  routeDistanceMiles: number;
  pickupLocation: Booking["pickupLocation"];
}): VehicleChoice {
  const store = getStore();
  const pricingRule = store.pricingRules.find((entry) => entry.category === category);
  if (!pricingRule) {
    throw new Error(`Missing pricing rule for ${category}`);
  }

  const price = buildQuote({
    input: { ...input, selectedVehicleCategory: category },
    pricingRule,
    distanceMiles: routeDistanceMiles
  });
  const matching = matchOperatorsForRequest({
    pickupLocation,
    vehicleCategory: category
  });
  const reviewTriggers = new Set<ReviewTrigger>(determineReviewTriggers(input, price.amount, routeDistanceMiles));
  if (matching.coverageStatus === "outside_coverage") {
    reviewTriggers.add("coverage_gap");
  }
  if (matching.eligibleOperatorIds.length === 0 && matching.coverageStatus !== "outside_coverage") {
    reviewTriggers.add("no_operator_available");
  }

  return {
    category,
    amount: price.amount,
    badge: getChoiceBadge(category, input.passengers),
    reason: getChoiceReason(category, input.passengers),
    coverageStatus: matching.coverageStatus,
    matchedOperatorIds: matching.matchedOperatorIds,
    eligibleOperatorIds: matching.eligibleOperatorIds,
    reviewTriggers: Array.from(reviewTriggers),
    isLaunchMarket: matching.isLaunchMarket
  };
}

function getChoiceBadge(category: VehicleCategory, passengers: number): VehicleChoice["badge"] {
  if ((passengers <= 6 && category === "suv") || (passengers > 6 && passengers <= 15 && category === "sprinter") || (passengers > 15 && category === "minibus")) {
    return "Best option";
  }
  if (category === "suv") {
    return "Budget-friendly";
  }
  return "More room";
}

function getChoiceReason(category: VehicleCategory, passengers: number) {
  if (category === "suv") {
    return passengers <= 6 ? "Best fit for smaller groups who want the lowest price." : "Only available for smaller groups.";
  }
  if (category === "sprinter") {
    return passengers <= 15 ? "Best mix of comfort, space, and value for most groups." : "A roomier upgrade if you want more space.";
  }
  return passengers <= 15
    ? "Extra space for groups that want the easiest ride day."
    : "Best fit for larger groups so everyone stays together.";
}
