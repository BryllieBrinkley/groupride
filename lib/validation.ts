import { z } from "zod";

const locationSchema = z.object({
  addressLine: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "Use a 2-letter state code").transform((value) => value.toUpperCase()),
  postalCode: z.string().optional()
});

export const tripRequestSchema = z
  .object({
    tripIntent: z.enum(["airport", "event", "team", "corporate", "other"]).optional(),
    planningHelp: z.boolean().optional(),
    conciergeTrip: z.boolean().optional(),
    arrivingByFlight: z.boolean().optional(),
    flightNumber: z.string().optional(),
    flightArrivalTime: z.string().optional(),
    multiDay: z.boolean().optional(),
    needsReturnTrip: z.boolean().optional(),
    tripType: z.enum(["one_way", "round_trip", "hourly"]),
    pickupLocation: locationSchema,
    dropoffLocation: locationSchema,
    stops: z.array(locationSchema).max(3, "Maximum 3 stops for self-serve"),
    pickupDateTimeLocal: z.string().min(10),
    returnDateTimeLocal: z.string().optional(),
    passengers: z.coerce.number().int().min(1).max(100),
    luggageCount: z.coerce.number().int().min(0).max(100),
    notes: z.string().max(500).optional(),
    contactName: z.string().min(2),
    contactEmail: z.string().email(),
    contactPhone: z.string().min(10),
    createAccount: z.boolean().optional().default(false),
    password: z.string().min(8).optional(),
    selectedVehicleCategory: z.enum(["suv", "sprinter", "minibus"]).optional(),
    paymentMethodToken: z.string().min(4).optional()
  })
  .superRefine((value, ctx) => {
    if (value.tripType === "round_trip" && !value.returnDateTimeLocal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["returnDateTimeLocal"],
        message: "Return time is required for round trips."
      });
    }
    if (value.createAccount && !value.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required to create an account."
      });
    }
    if (value.tripIntent === "airport" && value.arrivingByFlight) {
      if (!value.flightNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["flightNumber"],
          message: "Flight number is required."
        });
      }
      if (!value.flightArrivalTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["flightArrivalTime"],
          message: "Arrival time is required."
        });
      }
    }
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const adminReviewSchema = z.object({
  action: z.enum(["route_offers", "close_unfulfilled", "mark_no_supply"])
});

export const priceOverrideSchema = z.object({
  amount: z.coerce.number().positive(),
  reason: z.string().min(5)
});

export const tokenSchema = z.object({
  token: z.string().min(6)
});
