import type {
  AppUser,
  AuditLog,
  Booking,
  BookingOffer,
  CustomerProfile,
  DemoStore,
  NotificationLog,
  Operator,
  PaymentAttempt,
  PaymentMethodRecord,
  PricingRule,
  ServiceArea,
  Vehicle
} from "@/lib/types";
import { addHours, makeId, nowIso } from "@/lib/utils";
import { resolveFallbackLocation } from "@/lib/geo";

declare global {
  // eslint-disable-next-line no-var
  var __GROUPRIDE_STORE__: DemoStore | undefined;
}

function createPricingRules(): PricingRule[] {
  return [
    {
      id: "price_suv",
      category: "suv",
      baseFare: 35,
      ratePerMile: 2,
      minimumFare: 120,
      hourlyRate: 90,
      minimumHours: 2
    },
    {
      id: "price_sprinter",
      category: "sprinter",
      baseFare: 55,
      ratePerMile: 3,
      minimumFare: 220,
      hourlyRate: 135,
      minimumHours: 3
    },
    {
      id: "price_minibus",
      category: "minibus",
      baseFare: 85,
      ratePerMile: 4,
      minimumFare: 350,
      hourlyRate: 185,
      minimumHours: 4
    }
  ];
}

function buildInitialStore(): DemoStore {
  const createdAt = nowIso();

  const users: AppUser[] = [
    {
      id: "user_admin_1",
      role: "admin",
      email: "admin@groupride.app",
      name: "Ops Admin",
      password: "Admin123!"
    },
    {
      id: "user_operator_1",
      role: "operator",
      email: "ops@charlottemobility.com",
      name: "Charlotte Mobility Ops",
      password: "Operator123!",
      operatorId: "operator_1"
    },
    {
      id: "user_operator_2",
      role: "operator",
      email: "dispatch@queencitycharter.com",
      name: "Queen City Charter Dispatch",
      password: "Operator123!",
      operatorId: "operator_2"
    },
    {
      id: "user_customer_1",
      role: "customer",
      email: "planner@acmeevents.com",
      name: "Morgan Lee",
      password: "Customer123!",
      customerId: "customer_1"
    }
  ];

  const customers: CustomerProfile[] = [
    {
      id: "customer_1",
      userId: "user_customer_1",
      name: "Morgan Lee",
      email: "planner@acmeevents.com",
      phone: "704-555-0110"
    }
  ];

  const operators: Operator[] = [
    {
      id: "operator_1",
      companyName: "Charlotte Mobility Co.",
      serviceAreaIds: ["area_1"],
      rating: 4.9,
      status: "approved",
      createdAt
    },
    {
      id: "operator_2",
      companyName: "Queen City Charter",
      serviceAreaIds: ["area_2"],
      rating: 4.8,
      status: "approved",
      createdAt
    },
    {
      id: "operator_3",
      companyName: "Atlanta Event Transit",
      serviceAreaIds: ["area_3"],
      rating: 4.7,
      status: "approved",
      createdAt
    }
  ];

  const serviceAreas: ServiceArea[] = [
    {
      id: "area_1",
      operatorId: "operator_1",
      label: "Charlotte Core",
      city: "Charlotte",
      state: "NC",
      latitude: 35.2271,
      longitude: -80.8431,
      radiusMiles: 35,
      isLaunchMarket: true
    },
    {
      id: "area_2",
      operatorId: "operator_2",
      label: "Charlotte Regional",
      city: "Charlotte",
      state: "NC",
      latitude: 35.1907,
      longitude: -80.8464,
      radiusMiles: 55,
      isLaunchMarket: true
    },
    {
      id: "area_3",
      operatorId: "operator_3",
      label: "Atlanta Metro",
      city: "Atlanta",
      state: "GA",
      latitude: 33.749,
      longitude: -84.388,
      radiusMiles: 30,
      isLaunchMarket: false
    }
  ];

  const vehicles: Vehicle[] = [
    { id: "vehicle_1", operatorId: "operator_1", name: "Black SUV Fleet", category: "suv", capacity: 6, active: true, quantity: 4 },
    { id: "vehicle_2", operatorId: "operator_1", name: "Executive Sprinter", category: "sprinter", capacity: 14, active: true, quantity: 2 },
    { id: "vehicle_3", operatorId: "operator_2", name: "Sprinter XL", category: "sprinter", capacity: 15, active: true, quantity: 3 },
    { id: "vehicle_4", operatorId: "operator_2", name: "Charlotte Mini Coach", category: "minibus", capacity: 28, active: true, quantity: 2 },
    { id: "vehicle_5", operatorId: "operator_3", name: "Atlanta Sprinter", category: "sprinter", capacity: 15, active: true, quantity: 2 }
  ];

  const pickup1 = resolveFallbackLocation({
    addressLine: "500 S Tryon St",
    city: "Charlotte",
    state: "NC",
    postalCode: "28202"
  });
  const dropoff1 = resolveFallbackLocation({
    addressLine: "5501 Josh Birmingham Pkwy",
    city: "Charlotte",
    state: "NC",
    postalCode: "28208"
  });
  const pickup2 = resolveFallbackLocation({
    addressLine: "1 NASCAR Plaza",
    city: "Charlotte",
    state: "NC",
    postalCode: "28202"
  });
  const dropoff2 = resolveFallbackLocation({
    addressLine: "1000 NC Music Factory Blvd",
    city: "Charlotte",
    state: "NC",
    postalCode: "28206"
  });
  const pickup3 = resolveFallbackLocation({
    addressLine: "401 Biscayne Blvd",
    city: "Miami",
    state: "FL",
    postalCode: "33132"
  });
  const dropoff3 = resolveFallbackLocation({
    addressLine: "100 Chopin Plaza",
    city: "Miami",
    state: "FL",
    postalCode: "33131"
  });

  const bookings: Booking[] = [
    {
      id: "booking_confirmed_demo",
      channel: "web",
      customerProfileId: "customer_1",
      customerUserId: "user_customer_1",
      tripType: "one_way",
      pickupLocation: pickup1,
      dropoffLocation: dropoff1,
      stops: [],
      pickupDateTimeUtc: addHours(createdAt, 28),
      pickupDateTimeLocal: addHours(createdAt, 28),
      pickupTimezone: pickup1.timezone,
      passengers: 10,
      luggageCount: 8,
      vehicleCategory: "sprinter",
      priceLockedAmount: 278,
      activeAmount: 278,
      distanceMiles: 11.4,
      estimatedDurationMinutes: 26,
      serviceFee: 25,
      reviewTriggers: [],
      coverageStatus: "launch_market",
      status: "confirmed",
      paymentStatus: "paid",
      matchedOperatorIds: ["operator_1", "operator_2"],
      eligibleOperatorIds: ["operator_1", "operator_2"],
      selectedOperatorId: "operator_1",
      selectedOfferId: "offer_confirmed_demo",
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "booking_offer_demo",
      channel: "web",
      customerProfileId: "customer_1",
      customerUserId: "user_customer_1",
      tripType: "one_way",
      pickupLocation: pickup2,
      dropoffLocation: dropoff2,
      stops: [],
      pickupDateTimeUtc: addHours(createdAt, 52),
      pickupDateTimeLocal: addHours(createdAt, 52),
      pickupTimezone: pickup2.timezone,
      passengers: 14,
      luggageCount: 10,
      vehicleCategory: "sprinter",
      priceLockedAmount: 241,
      activeAmount: 241,
      distanceMiles: 7.2,
      estimatedDurationMinutes: 22,
      serviceFee: 25,
      reviewTriggers: [],
      coverageStatus: "launch_market",
      status: "operator_offer_open",
      paymentStatus: "payment_method_saved",
      matchedOperatorIds: ["operator_1", "operator_2"],
      eligibleOperatorIds: ["operator_1", "operator_2"],
      offerExpiresAt: addHours(createdAt, 2),
      createdAt,
      updatedAt: createdAt
    },
    {
      id: "booking_review_demo",
      channel: "web",
      customerProfileId: "customer_1",
      customerUserId: "user_customer_1",
      tripType: "hourly",
      pickupLocation: pickup3,
      dropoffLocation: dropoff3,
      stops: [],
      pickupDateTimeUtc: addHours(createdAt, 72),
      pickupDateTimeLocal: addHours(createdAt, 72),
      pickupTimezone: pickup3.timezone,
      passengers: 18,
      luggageCount: 6,
      notes: "Corporate summit shuttle request.",
      vehicleCategory: "minibus",
      priceLockedAmount: 765,
      activeAmount: 765,
      distanceMiles: 4.2,
      estimatedDurationMinutes: 18,
      serviceFee: 25,
      reviewTriggers: ["hourly_trip", "coverage_gap"],
      coverageStatus: "outside_coverage",
      status: "manual_review_pending",
      paymentStatus: "payment_method_saved",
      matchedOperatorIds: [],
      eligibleOperatorIds: [],
      createdAt,
      updatedAt: createdAt
    }
  ];

  const offers: BookingOffer[] = [
    {
      id: "offer_confirmed_demo",
      bookingId: "booking_confirmed_demo",
      operatorId: "operator_1",
      vehicleCategory: "sprinter",
      status: "accepted",
      createdAt,
      expiresAt: addHours(createdAt, 2),
      actedAt: createdAt
    },
    {
      id: "offer_pending_demo_1",
      bookingId: "booking_offer_demo",
      operatorId: "operator_1",
      vehicleCategory: "sprinter",
      status: "pending",
      createdAt,
      expiresAt: addHours(createdAt, 2)
    },
    {
      id: "offer_pending_demo_2",
      bookingId: "booking_offer_demo",
      operatorId: "operator_2",
      vehicleCategory: "sprinter",
      status: "pending",
      createdAt,
      expiresAt: addHours(createdAt, 2)
    }
  ];

  const paymentMethods: PaymentMethodRecord[] = [
    {
      id: "pm_demo_1",
      bookingId: "booking_confirmed_demo",
      customerEmail: "planner@acmeevents.com",
      provider: "demo",
      providerPaymentMethodId: "pm_demo_saved",
      status: "saved",
      createdAt
    }
  ];

  const paymentAttempts: PaymentAttempt[] = [
    {
      id: "pay_attempt_1",
      bookingId: "booking_confirmed_demo",
      amount: 278,
      status: "paid",
      provider: "demo",
      providerIntentId: "pi_demo_1",
      createdAt
    }
  ];

  const notifications: NotificationLog[] = [
    {
      id: "notif_1",
      bookingId: "booking_confirmed_demo",
      type: "booking_confirmed",
      recipient: "planner@acmeevents.com",
      channel: "email",
      subject: "Your GroupRide booking is confirmed",
      sentAt: createdAt
    }
  ];

  const audits: AuditLog[] = [
    {
      id: "audit_1",
      bookingId: "booking_confirmed_demo",
      actor: "system",
      action: "booking_confirmed",
      details: "Demo confirmed booking seeded.",
      createdAt
    }
  ];

  return {
    users,
    customers,
    operators,
    serviceAreas,
    vehicles,
    pricingRules: createPricingRules(),
    bookings,
    offers,
    paymentMethods,
    paymentAttempts,
    notifications,
    audits
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
