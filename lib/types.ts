export type Role = "admin" | "operator" | "customer";

export type TripType = "one_way" | "round_trip" | "hourly";
export type TripIntent = "airport" | "event" | "team" | "corporate" | "other";

export type VehicleCategory = "suv" | "sprinter" | "minibus";

export type BookingStatus =
  | "draft"
  | "quoted"
  | "requested"
  | "operator_offer_open"
  | "manual_review_pending"
  | "customer_approval_required"
  | "operator_accepted"
  | "payment_processing"
  | "payment_action_required"
  | "confirmed"
  | "offer_expired"
  | "no_operator_available"
  | "cancelled"
  | "refunded"
  | "closed_unfulfilled";

export type OfferStatus = "pending" | "accepted" | "declined" | "expired" | "closed";

export type ReviewTrigger =
  | "capacity_overflow"
  | "distance_limit"
  | "stop_limit"
  | "high_value"
  | "hourly_trip"
  | "coverage_gap"
  | "no_operator_available"
  | "offer_expired";

export type PaymentStatus =
  | "not_collected"
  | "payment_method_saved"
  | "processing"
  | "requires_action"
  | "paid"
  | "refunded";

export type CancellationOutcome = "full_refund" | "half_refund" | "no_refund" | "no_charge";

export type BookingChannel = "web";

export type CoverageStatus = "covered" | "launch_market" | "outside_coverage";

export interface SessionUser {
  id: string;
  role: Role;
  email: string;
  name: string;
  operatorId?: string;
}

export interface AppUser extends SessionUser {
  phone?: string;
  password: string;
  customerId?: string;
}

export interface CustomerProfile {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
}

export interface ServiceArea {
  id: string;
  operatorId: string;
  label: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  radiusMiles: number;
  isLaunchMarket: boolean;
}

export interface Operator {
  id: string;
  companyName: string;
  serviceAreaIds: string[];
  rating: number;
  status: "approved" | "pending" | "inactive";
  createdAt: string;
}

export interface Vehicle {
  id: string;
  operatorId: string;
  name: string;
  category: VehicleCategory;
  capacity: number;
  active: boolean;
  quantity: number;
}

export interface PricingRule {
  id: string;
  category: VehicleCategory;
  baseFare: number;
  ratePerMile: number;
  minimumFare: number;
  hourlyRate: number;
  minimumHours: number;
}

export interface LocationInput {
  addressLine: string;
  city: string;
  state: string;
  postalCode?: string;
}

export interface ResolvedLocation extends LocationInput {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface BookingStop {
  id: string;
  order: number;
  location: ResolvedLocation;
}

export interface TripRequestInput {
  tripIntent?: TripIntent;
  planningHelp?: boolean;
  conciergeTrip?: boolean;
  arrivingByFlight?: boolean;
  flightNumber?: string;
  flightArrivalTime?: string;
  multiDay?: boolean;
  needsReturnTrip?: boolean;
  tripType: TripType;
  pickupLocation: LocationInput;
  dropoffLocation: LocationInput;
  stops: LocationInput[];
  pickupDateTimeLocal: string;
  returnDateTimeLocal?: string;
  passengers: number;
  luggageCount: number;
  notes?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  createAccount?: boolean;
  password?: string;
  selectedVehicleCategory?: VehicleCategory;
  paymentMethodToken?: string;
}

export interface RouteEstimate {
  distanceMiles: number;
  estimatedDurationMinutes: number;
  pickup: ResolvedLocation;
  dropoff: ResolvedLocation;
  stops: BookingStop[];
}

export interface QuoteResult {
  recommendedVehicle: VehicleCategory;
  amount: number;
  baseFare: number;
  perMileCharge: number;
  serviceFee: number;
  minimumApplied: boolean;
  route: RouteEstimate;
  reviewTriggers: ReviewTrigger[];
  coverageStatus: CoverageStatus;
  matchedOperatorIds: string[];
  eligibleOperatorIds: string[];
  isLaunchMarket: boolean;
  notes: string[];
  vehicleChoices: VehicleChoice[];
}

export interface VehicleChoice {
  category: VehicleCategory;
  amount: number;
  badge: "Best option" | "More room" | "Budget-friendly";
  reason: string;
  coverageStatus: CoverageStatus;
  matchedOperatorIds: string[];
  eligibleOperatorIds: string[];
  reviewTriggers: ReviewTrigger[];
  isLaunchMarket: boolean;
}

export interface PaymentMethodRecord {
  id: string;
  bookingId: string;
  customerEmail: string;
  provider: "demo" | "stripe";
  providerPaymentMethodId: string;
  status: "saved" | "failed";
  createdAt: string;
}

export interface PaymentAttempt {
  id: string;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  provider: "demo" | "stripe";
  providerIntentId: string;
  failureReason?: string;
  createdAt: string;
}

export interface BookingOffer {
  id: string;
  bookingId: string;
  operatorId: string;
  vehicleCategory: VehicleCategory;
  status: OfferStatus;
  createdAt: string;
  expiresAt: string;
  actedAt?: string;
}

export interface Booking {
  id: string;
  channel: BookingChannel;
  customerProfileId: string;
  customerUserId?: string;
  tripIntent?: TripIntent;
  planningHelp?: boolean;
  conciergeTrip?: boolean;
  arrivingByFlight?: boolean;
  flightNumber?: string;
  flightArrivalTime?: string;
  multiDay?: boolean;
  needsReturnTrip?: boolean;
  tripType: TripType;
  pickupLocation: ResolvedLocation;
  dropoffLocation: ResolvedLocation;
  stops: BookingStop[];
  pickupDateTimeUtc: string;
  pickupDateTimeLocal: string;
  returnDateTimeUtc?: string;
  returnDateTimeLocal?: string;
  pickupTimezone: string;
  passengers: number;
  luggageCount: number;
  notes?: string;
  vehicleCategory: VehicleCategory;
  priceLockedAmount: number;
  activeAmount: number;
  distanceMiles: number;
  estimatedDurationMinutes: number;
  serviceFee: number;
  reviewTriggers: ReviewTrigger[];
  coverageStatus: CoverageStatus;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  matchedOperatorIds: string[];
  eligibleOperatorIds: string[];
  selectedOperatorId?: string;
  selectedOfferId?: string;
  offerExpiresAt?: string;
  priceOverrideReason?: string;
  approvalToken?: string;
  paymentRecoveryToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  bookingId?: string;
  type:
    | "request_received"
    | "manual_review_received"
    | "revised_quote_needed"
    | "operator_offer"
    | "operator_accepted"
    | "payment_action_required"
    | "booking_confirmed"
    | "booking_cancelled"
    | "refund_processed"
    | "booking_unfulfilled";
  recipient: string;
  channel: "email";
  subject: string;
  sentAt: string;
}

export interface AuditLog {
  id: string;
  bookingId?: string;
  actor: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface DemoStore {
  users: AppUser[];
  customers: CustomerProfile[];
  operators: Operator[];
  serviceAreas: ServiceArea[];
  vehicles: Vehicle[];
  pricingRules: PricingRule[];
  bookings: Booking[];
  offers: BookingOffer[];
  paymentMethods: PaymentMethodRecord[];
  paymentAttempts: PaymentAttempt[];
  notifications: NotificationLog[];
  audits: AuditLog[];
}

export interface DashboardMetrics {
  totalRequests: number;
  pendingReview: number;
  openOffers: number;
  confirmedTrips: number;
  grossBookedRevenue: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface QuoteApprovalInput {
  token: string;
}

export interface AdminReviewInput {
  action: "route_offers" | "close_unfulfilled" | "mark_no_supply";
}

export interface PriceOverrideInput {
  amount: number;
  reason: string;
}

export interface PaymentCaptureResult {
  paymentStatus: PaymentStatus;
  paymentIntentId: string;
  recoveryToken?: string;
  failureReason?: string;
}
