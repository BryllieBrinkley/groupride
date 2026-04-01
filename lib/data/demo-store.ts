import type {
  AuthAccount,
  Booking,
  BookingPassenger,
  BookingStop,
  DemoStore,
  Driver,
  NotificationRecord,
  Operator,
  Payment,
  Payout,
  PricingRule,
  Profile,
  Quote,
  Review,
  SupportThread,
  UploadedDocument,
  Vehicle,
} from "@/lib/types";
import { addHours, makeId, nowIso } from "@/lib/utils";
import { resolveFallbackLocation } from "@/lib/geo";

declare global {
  // eslint-disable-next-line no-var
  var __GROUPRIDE_STORE__: DemoStore | undefined;
}

function createPricingRules(createdAt: string): PricingRule[] {
  return [
    {
      id: "pricing_suv_default",
      category: "suv",
      name: "Executive SUV",
      region: "Charlotte",
      baseFare: 95,
      ratePerMile: 3,
      minimumFare: 180,
      hourlyRate: 110,
      minimumHours: 2,
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "pricing_sprinter_default",
      category: "sprinter",
      name: "Sprinter Van",
      region: "Charlotte",
      baseFare: 160,
      ratePerMile: 4,
      minimumFare: 320,
      hourlyRate: 165,
      minimumHours: 3,
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "pricing_minibus_default",
      category: "minibus",
      name: "Mini Bus",
      region: "Charlotte",
      baseFare: 220,
      ratePerMile: 5,
      minimumFare: 480,
      hourlyRate: 210,
      minimumHours: 4,
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
  ];
}

function buildInitialStore(): DemoStore {
  const createdAt = nowIso();

  const profiles: Profile[] = [
    {
      id: "profile_admin_1",
      role: "admin",
      fullName: "Ops Admin",
      email: "admin@groupride.app",
      phone: "704-555-0100",
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "profile_operator_1",
      role: "operator",
      fullName: "Charlotte Mobility Ops",
      email: "ops@charlottemobility.com",
      phone: "704-555-0111",
      status: "active",
      defaultOperatorId: "operator_1",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "profile_operator_2",
      role: "operator",
      fullName: "Queen City Charter Dispatch",
      email: "dispatch@queencitycharter.com",
      phone: "704-555-0122",
      status: "active",
      defaultOperatorId: "operator_2",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "profile_customer_1",
      role: "customer",
      fullName: "Morgan Lee",
      email: "planner@acmeevents.com",
      phone: "704-555-0133",
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const authAccounts: AuthAccount[] = [
    {
      id: "auth_admin_1",
      profileId: "profile_admin_1",
      email: "admin@groupride.app",
      password: "Admin123!",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "auth_operator_1",
      profileId: "profile_operator_1",
      email: "ops@charlottemobility.com",
      password: "Operator123!",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "auth_customer_1",
      profileId: "profile_customer_1",
      email: "planner@acmeevents.com",
      password: "Customer123!",
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const operators: Operator[] = [
    {
      id: "operator_1",
      profileId: "profile_operator_1",
      companyName: "Charlotte Mobility Co.",
      legalBusinessName: "Charlotte Mobility Co. LLC",
      status: "active",
      rating: 4.9,
      completedTrips: 182,
      payoutAccountConnected: true,
      serviceAreas: ["Charlotte", "Concord", "Fort Mill"],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "operator_2",
      profileId: "profile_operator_2",
      companyName: "Queen City Charter",
      legalBusinessName: "Queen City Charter Inc.",
      status: "active",
      rating: 4.8,
      completedTrips: 119,
      payoutAccountConnected: true,
      serviceAreas: ["Charlotte", "Gastonia", "Greensboro"],
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const vehicles: Vehicle[] = [
    {
      id: "vehicle_1",
      operatorId: "operator_1",
      name: "Executive Sprinter",
      category: "sprinter",
      capacity: 14,
      luggageCapacity: 12,
      quantity: 2,
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "vehicle_2",
      operatorId: "operator_1",
      name: "Black SUV Fleet",
      category: "suv",
      capacity: 6,
      luggageCapacity: 6,
      quantity: 4,
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "vehicle_3",
      operatorId: "operator_2",
      name: "Charlotte Mini Coach",
      category: "minibus",
      capacity: 28,
      luggageCapacity: 24,
      quantity: 2,
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const drivers: Driver[] = [
    {
      id: "driver_1",
      operatorId: "operator_1",
      fullName: "Chris Holloway",
      phone: "704-555-0200",
      licenseNumber: "NC-DL-001",
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "driver_2",
      operatorId: "operator_2",
      fullName: "Avery Collins",
      phone: "704-555-0201",
      licenseNumber: "NC-DL-002",
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const pickupAirport = resolveFallbackLocation({
    addressLine: "500 S Tryon St",
    city: "Charlotte",
    state: "NC",
    postalCode: "28202",
  });
  const dropoffAirport = resolveFallbackLocation({
    addressLine: "5501 Josh Birmingham Pkwy",
    city: "Charlotte",
    state: "NC",
    postalCode: "28208",
  });
  const pickupStadium = resolveFallbackLocation({
    addressLine: "800 S Mint St",
    city: "Charlotte",
    state: "NC",
    postalCode: "28202",
  });
  const dropoffStadium = resolveFallbackLocation({
    addressLine: "333 E Trade St",
    city: "Charlotte",
    state: "NC",
    postalCode: "28202",
  });
  const pickupHotel = resolveFallbackLocation({
    addressLine: "100 W Trade St",
    city: "Charlotte",
    state: "NC",
    postalCode: "28202",
  });
  const dropoffHotel = resolveFallbackLocation({
    addressLine: "501 S College St",
    city: "Charlotte",
    state: "NC",
    postalCode: "28202",
  });

  const bookings: Booking[] = [
    {
      id: "booking_pending_1",
      reference: "GR-1001",
      customerProfileId: "profile_customer_1",
      status: "pending",
      tripType: "one_way",
      tripIntent: "airport",
      pickupLocation: pickupAirport,
      dropoffLocation: dropoffAirport,
      pickupDateTimeLocal: addHours(createdAt, 36),
      pickupDateTimeUtc: addHours(createdAt, 36),
      passengers: 12,
      luggageCount: 10,
      requestedVehicleCategory: "sprinter",
      notes: "Airport departure with luggage support.",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "booking_quoted_1",
      reference: "GR-1002",
      customerProfileId: "profile_customer_1",
      operatorId: "operator_1",
      status: "quoted",
      tripType: "one_way",
      tripIntent: "event",
      pickupLocation: pickupStadium,
      dropoffLocation: dropoffStadium,
      pickupDateTimeLocal: addHours(createdAt, 48),
      pickupDateTimeUtc: addHours(createdAt, 48),
      passengers: 24,
      luggageCount: 2,
      requestedVehicleCategory: "minibus",
      quotedAmount: 540,
      notes: "Game-day transfer.",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "booking_confirmed_1",
      reference: "GR-1003",
      customerProfileId: "profile_customer_1",
      operatorId: "operator_1",
      vehicleId: "vehicle_1",
      driverId: "driver_1",
      acceptedQuoteId: "quote_accepted_1",
      status: "assigned",
      tripType: "one_way",
      tripIntent: "corporate",
      pickupLocation: pickupHotel,
      dropoffLocation: dropoffHotel,
      pickupDateTimeLocal: addHours(createdAt, 12),
      pickupDateTimeUtc: addHours(createdAt, 12),
      passengers: 10,
      luggageCount: 4,
      requestedVehicleCategory: "sprinter",
      quotedAmount: 385,
      finalAmount: 385,
      paymentIntentId: "pi_demo_confirmed_1",
      paymentStatus: "succeeded",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "booking_completed_1",
      reference: "GR-1004",
      customerProfileId: "profile_customer_1",
      operatorId: "operator_2",
      vehicleId: "vehicle_3",
      driverId: "driver_2",
      acceptedQuoteId: "quote_accepted_2",
      status: "completed",
      tripType: "one_way",
      tripIntent: "team",
      pickupLocation: pickupHotel,
      dropoffLocation: dropoffAirport,
      pickupDateTimeLocal: addHours(createdAt, -96),
      pickupDateTimeUtc: addHours(createdAt, -96),
      passengers: 20,
      luggageCount: 16,
      requestedVehicleCategory: "minibus",
      quotedAmount: 620,
      finalAmount: 620,
      paymentIntentId: "pi_demo_completed_1",
      paymentStatus: "succeeded",
      completedAt: addHours(createdAt, -95),
      createdAt: addHours(createdAt, -120),
      updatedAt: addHours(createdAt, -95),
    },
  ];

  const bookingPassengers: BookingPassenger[] = [
    { id: "bp_1", bookingId: "booking_pending_1", fullName: "Morgan Lee", email: "planner@acmeevents.com", createdAt },
    { id: "bp_2", bookingId: "booking_confirmed_1", fullName: "Alex Tran", email: "alex@acmeevents.com", createdAt },
  ];

  const bookingStops: BookingStop[] = [
    { id: "stop_1", bookingId: "booking_pending_1", order: 1, location: pickupAirport, createdAt },
    { id: "stop_2", bookingId: "booking_pending_1", order: 2, location: dropoffAirport, createdAt },
  ];

  const quotes: Quote[] = [
    {
      id: "quote_sent_1",
      bookingId: "booking_quoted_1",
      operatorId: "operator_1",
      createdByProfileId: "profile_operator_1",
      source: "operator",
      vehicleCategory: "minibus",
      vehicleId: "vehicle_3",
      amount: 540,
      serviceFee: 35,
      notes: "Premium event transfer with arrival buffer included.",
      status: "sent",
      expiresAt: addHours(createdAt, 24),
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "quote_accepted_1",
      bookingId: "booking_confirmed_1",
      operatorId: "operator_1",
      createdByProfileId: "profile_admin_1",
      source: "admin",
      vehicleCategory: "sprinter",
      vehicleId: "vehicle_1",
      amount: 385,
      serviceFee: 25,
      status: "accepted",
      acceptedAt: addHours(createdAt, -1),
      createdAt: addHours(createdAt, -6),
      updatedAt: addHours(createdAt, -1),
    },
    {
      id: "quote_accepted_2",
      bookingId: "booking_completed_1",
      operatorId: "operator_2",
      createdByProfileId: "profile_admin_1",
      source: "admin",
      vehicleCategory: "minibus",
      vehicleId: "vehicle_3",
      amount: 620,
      serviceFee: 25,
      status: "accepted",
      acceptedAt: addHours(createdAt, -118),
      createdAt: addHours(createdAt, -121),
      updatedAt: addHours(createdAt, -118),
    },
  ];

  const payments: Payment[] = [
    {
      id: "payment_1",
      bookingId: "booking_confirmed_1",
      quoteId: "quote_accepted_1",
      customerProfileId: "profile_customer_1",
      provider: "demo",
      paymentIntentId: "pi_demo_confirmed_1",
      paymentMethodId: "pm_demo_saved",
      amount: 385,
      currency: "usd",
      status: "succeeded",
      createdAt: addHours(createdAt, -1),
      updatedAt: addHours(createdAt, -1),
    },
    {
      id: "payment_2",
      bookingId: "booking_completed_1",
      quoteId: "quote_accepted_2",
      customerProfileId: "profile_customer_1",
      provider: "demo",
      paymentIntentId: "pi_demo_completed_1",
      paymentMethodId: "pm_demo_saved",
      amount: 620,
      currency: "usd",
      status: "succeeded",
      createdAt: addHours(createdAt, -118),
      updatedAt: addHours(createdAt, -118),
    },
  ];

  const payouts: Payout[] = [
    {
      id: "payout_1",
      bookingId: "booking_completed_1",
      operatorId: "operator_2",
      provider: "demo",
      grossAmount: 620,
      platformFeeAmount: 62,
      payoutAmount: 558,
      status: "paid",
      paidAt: addHours(createdAt, -72),
      createdAt: addHours(createdAt, -95),
      updatedAt: addHours(createdAt, -72),
    },
  ];

  const notifications: NotificationRecord[] = [
    {
      id: "notification_1",
      profileId: "profile_customer_1",
      bookingId: "booking_quoted_1",
      quoteId: "quote_sent_1",
      type: "quote_created",
      title: "New quote ready",
      message: "Your GroupRide quote is ready for review.",
      channel: "email",
      recipient: "planner@acmeevents.com",
      status: "sent",
      createdAt,
      sentAt: createdAt,
    },
    {
      id: "notification_2",
      profileId: "profile_operator_2",
      bookingId: "booking_completed_1",
      payoutId: "payout_1",
      type: "payout_updated",
      title: "Payout sent",
      message: "Your GroupRide payout has been marked paid.",
      channel: "in_app",
      recipient: "dispatch@queencitycharter.com",
      status: "sent",
      createdAt: addHours(createdAt, -72),
      sentAt: addHours(createdAt, -72),
    },
  ];

  const supportThreads: SupportThread[] = [
    {
      id: "thread_1",
      bookingId: "booking_pending_1",
      profileId: "profile_customer_1",
      subject: "Arrival timing confirmation",
      status: "open",
      lastMessageAt: createdAt,
      createdAt,
      updatedAt: createdAt,
    },
  ];

  const reviews: Review[] = [
    {
      id: "review_1",
      bookingId: "booking_completed_1",
      customerProfileId: "profile_customer_1",
      operatorId: "operator_2",
      rating: 5,
      title: "Smooth event transfer",
      body: "Everything was on time and polished.",
      status: "published",
      createdAt: addHours(createdAt, -70),
      updatedAt: addHours(createdAt, -70),
    },
  ];

  const uploadedDocuments: UploadedDocument[] = [
    {
      id: "document_1",
      operatorId: "operator_1",
      profileId: "profile_operator_1",
      type: "insurance",
      fileName: "insurance-certificate.pdf",
      storagePath: "operators/operator_1/insurance-certificate.pdf",
      mimeType: "application/pdf",
      createdAt,
    },
  ];

  return {
    authAccounts,
    profiles,
    operators,
    vehicles,
    drivers,
    bookings,
    bookingPassengers,
    bookingStops,
    quotes,
    payments,
    payouts,
    notifications,
    supportThreads,
    reviews,
    pricingRules: createPricingRules(createdAt),
    uploadedDocuments,
  };
}

export function getStore() {
  if (!global.__GROUPRIDE_STORE__) {
    global.__GROUPRIDE_STORE__ = buildInitialStore();
  }

  return global.__GROUPRIDE_STORE__;
}

export function resetStore() {
  global.__GROUPRIDE_STORE__ = buildInitialStore();
}

export function createReference() {
  return `GR-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

export function createId(prefix: string) {
  return makeId(prefix);
}
