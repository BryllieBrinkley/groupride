export type Role = "customer" | "operator" | "admin";

export type ProfileStatus = "active" | "invited" | "suspended";
export type OperatorStatus = "pending" | "active" | "suspended";
export type DriverStatus = "active" | "inactive";
export type VehicleStatus = "active" | "inactive" | "maintenance";

export type TripType = "one_way" | "round_trip" | "hourly";
export type TripIntent = "airport" | "event" | "team" | "corporate" | "other";
export type VehicleCategory = "suv" | "sprinter" | "minibus" | "charter_bus";

export type BookingStatus =
  | "pending"
  | "quoted"
  | "awaiting_payment"
  | "confirmed"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type QuoteStatus = "draft" | "sent" | "accepted" | "expired" | "rejected" | "cancelled";
export type PaymentStatus = "pending" | "requires_action" | "succeeded" | "failed" | "refunded";
export type PayoutStatus = "pending" | "in_transit" | "paid" | "failed" | "cancelled";
export type NotificationChannel = "email" | "sms" | "in_app";
export type NotificationStatus = "queued" | "sent" | "failed" | "read";
export type ReviewStatus = "pending" | "published" | "hidden";
export type SupportThreadStatus = "open" | "pending" | "resolved" | "closed";
export type PaymentProvider = "stripe" | "demo";
export type PayoutProvider = "stripe_connect" | "demo";
export type UploadedDocumentType = "insurance" | "license" | "registration" | "w9" | "other";
export type QuoteSource = "admin" | "operator" | "system";

export interface SessionUser {
  id: string;
  profileId: string;
  role: Role;
  email: string;
  name: string;
  operatorId?: string;
}

export interface AuthAccount {
  id: string;
  profileId: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  phone?: string;
  status: ProfileStatus;
  avatarUrl?: string;
  defaultOperatorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Operator {
  id: string;
  profileId: string;
  companyName: string;
  legalBusinessName?: string;
  status: OperatorStatus;
  rating: number;
  completedTrips: number;
  payoutAccountConnected: boolean;
  serviceAreas: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  operatorId: string;
  name: string;
  category: VehicleCategory;
  capacity: number;
  luggageCapacity: number;
  quantity: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  operatorId: string;
  profileId?: string;
  fullName: string;
  phone?: string;
  licenseNumber?: string;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PricingRule {
  id: string;
  operatorId?: string;
  category: VehicleCategory;
  name: string;
  region: string;
  baseFare: number;
  ratePerMile: number;
  minimumFare: number;
  hourlyRate: number;
  minimumHours: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
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

export interface GooglePlaceSelection {
  displayLabel: string;
  formattedAddress: string;
  placeId: string;
  latitude: number;
  longitude: number;
}

export interface RouteMetrics {
  distanceMiles: number;
  driveTimeMinutes: number;
  formattedRouteText: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
}

export interface QuotePricingInput {
  tripType: TripType;
  baseFare: number;
  perMileRate: number;
  hourlyRate: number;
  minimumCharge: number;
  distanceMiles: number;
  driveTimeMinutes: number;
  airportSurcharge?: number;
  luggageCount?: number;
  luggageSurchargePerBag?: number;
  tolls?: number;
  lateNightFee?: number;
}

export interface QuotePricingBreakdown {
  subtotal: number;
  total: number;
  baseFare: number;
  mileageCharge: number;
  hourlyCharge: number;
  airportSurcharge: number;
  luggageSurcharge: number;
  tolls: number;
  lateNightFee: number;
  minimumApplied: boolean;
}

export interface BookingStop {
  id: string;
  bookingId: string;
  order: number;
  location: ResolvedLocation;
  createdAt: string;
}

export interface BookingPassenger {
  id: string;
  bookingId: string;
  fullName?: string;
  email?: string;
  phone?: string;
  seatLabel?: string;
  createdAt: string;
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
  distanceMiles?: number;
  driveTimeMinutes?: number;
  formattedRouteText?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
}

export interface RouteEstimate {
  distanceMiles: number;
  estimatedDurationMinutes: number;
  pickup: ResolvedLocation;
  dropoff: ResolvedLocation;
  stops: Array<{
    id: string;
    order: number;
    location: ResolvedLocation;
  }>;
}

export interface VehicleChoice {
  category: VehicleCategory;
  amount: number;
  badge: "Best option" | "More room" | "Budget-friendly";
  reason: string;
}

export interface QuoteResult {
  recommendedVehicle: VehicleCategory;
  amount: number;
  baseFare: number;
  perMileCharge: number;
  serviceFee: number;
  minimumApplied: boolean;
  route: RouteEstimate;
  notes: string[];
  vehicleChoices: VehicleChoice[];
}

export interface Booking {
  id: string;
  reference: string;
  customerProfileId: string;
  operatorId?: string;
  vehicleId?: string;
  driverId?: string;
  acceptedQuoteId?: string;
  status: BookingStatus;
  tripType: TripType;
  tripIntent?: TripIntent;
  pickupLocation: ResolvedLocation;
  dropoffLocation: ResolvedLocation;
  distanceMiles?: number;
  driveTimeMinutes?: number;
  formattedRouteText?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  pickupDateTimeLocal: string;
  pickupDateTimeUtc: string;
  returnDateTimeLocal?: string;
  returnDateTimeUtc?: string;
  passengers: number;
  luggageCount: number;
  requestedVehicleCategory?: VehicleCategory;
  quotedAmount?: number;
  finalAmount?: number;
  notes?: string;
  conciergeTrip?: boolean;
  paymentIntentId?: string;
  paymentStatus?: PaymentStatus;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  bookingId: string;
  operatorId?: string;
  createdByProfileId: string;
  source: QuoteSource;
  vehicleCategory: VehicleCategory;
  vehicleId?: string;
  amount: number;
  depositAmount?: number;
  serviceFee: number;
  notes?: string;
  status: QuoteStatus;
  expiresAt?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  quoteId?: string;
  customerProfileId: string;
  provider: PaymentProvider;
  paymentIntentId?: string;
  paymentMethodId?: string;
  amount: number;
  currency: "usd";
  status: PaymentStatus;
  refundAmount?: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  bookingId: string;
  operatorId: string;
  provider: PayoutProvider;
  providerTransferId?: string;
  grossAmount: number;
  platformFeeAmount: number;
  payoutAmount: number;
  status: PayoutStatus;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  profileId?: string;
  bookingId?: string;
  quoteId?: string;
  payoutId?: string;
  type:
    | "booking_created"
    | "booking_status_updated"
    | "quote_created"
    | "quote_accepted"
    | "payment_requires_action"
    | "payment_succeeded"
    | "payout_updated"
    | "support_thread_updated";
  title: string;
  message: string;
  channel: NotificationChannel;
  recipient: string;
  status: NotificationStatus;
  createdAt: string;
  sentAt?: string;
  readAt?: string;
}

export interface SupportThread {
  id: string;
  bookingId?: string;
  profileId: string;
  subject: string;
  status: SupportThreadStatus;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerProfileId: string;
  operatorId: string;
  rating: number;
  title?: string;
  body?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UploadedDocument {
  id: string;
  profileId?: string;
  operatorId?: string;
  driverId?: string;
  type: UploadedDocumentType;
  fileName: string;
  storagePath: string;
  mimeType: string;
  createdAt: string;
}

export interface DemoStore {
  authAccounts: AuthAccount[];
  profiles: Profile[];
  operators: Operator[];
  vehicles: Vehicle[];
  drivers: Driver[];
  bookings: Booking[];
  bookingPassengers: BookingPassenger[];
  bookingStops: BookingStop[];
  quotes: Quote[];
  payments: Payment[];
  payouts: Payout[];
  notifications: NotificationRecord[];
  supportThreads: SupportThread[];
  reviews: Review[];
  pricingRules: PricingRule[];
  uploadedDocuments: UploadedDocument[];
}

export interface BookingWithRelations {
  booking: Booking;
  customer: Profile | null;
  operator: Operator | null;
  vehicle: Vehicle | null;
  driver: Driver | null;
  quotes: Quote[];
  payment: Payment | null;
  payout: Payout | null;
  passengers: BookingPassenger[];
  stops: BookingStop[];
}

export interface OperatorSummary {
  operator: Operator;
  profile: Profile | null;
  vehicles: Vehicle[];
  drivers: Driver[];
}

export interface CustomerDashboardMetrics {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalSpend: number;
}

export interface OperatorDashboardMetrics {
  pendingQuotes: number;
  assignedTrips: number;
  completedTrips: number;
  pendingPayouts: number;
}

export interface AdminDashboardMetrics {
  totalBookings: number;
  pendingBookings: number;
  openQuotes: number;
  confirmedRevenue: number;
  activeOperators: number;
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

export interface AdminReviewInput {
  action: "request_quote" | "cancel_booking" | "mark_confirmed";
}

export interface PriceOverrideInput {
  amount: number;
  reason: string;
}

export interface QuoteApprovalInput {
  quoteId: string;
}

export interface PaymentCaptureResult {
  paymentStatus: PaymentStatus;
  paymentIntentId: string;
  clientSecret?: string;
  failureReason?: string;
}
