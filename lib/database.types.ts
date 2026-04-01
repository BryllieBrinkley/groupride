import type {
  BookingStatus,
  DriverStatus,
  NotificationChannel,
  NotificationStatus,
  OperatorStatus,
  PaymentProvider,
  PaymentStatus,
  PayoutProvider,
  PayoutStatus,
  ProfileStatus,
  QuoteStatus,
  ReviewStatus,
  Role,
  SupportThreadStatus,
  TripIntent,
  TripType,
  UploadedDocumentType,
  VehicleCategory,
  VehicleStatus,
} from "@/lib/types";

type Timestamp = string;

export interface Database {
  public: {
    Enums: {
      role: Role;
      profile_status: ProfileStatus;
      operator_status: OperatorStatus;
      driver_status: DriverStatus;
      vehicle_status: VehicleStatus;
      trip_type: TripType;
      trip_intent: TripIntent;
      vehicle_category: VehicleCategory;
      booking_status: BookingStatus;
      quote_status: QuoteStatus;
      payment_status: PaymentStatus;
      payout_status: PayoutStatus;
      payment_provider: PaymentProvider;
      payout_provider: PayoutProvider;
      notification_channel: NotificationChannel;
      notification_status: NotificationStatus;
      support_thread_status: SupportThreadStatus;
      review_status: ReviewStatus;
      uploaded_document_type: UploadedDocumentType;
    };
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Role;
          full_name: string;
          email: string;
          phone: string | null;
          status: ProfileStatus;
          avatar_url: string | null;
          default_operator_id: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      operators: {
        Row: {
          id: string;
          profile_id: string;
          company_name: string;
          legal_business_name: string | null;
          status: OperatorStatus;
          rating: number;
          completed_trips: number;
          payout_account_connected: boolean;
          service_areas: string[];
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      vehicles: {
        Row: {
          id: string;
          operator_id: string;
          name: string;
          category: VehicleCategory;
          capacity: number;
          luggage_capacity: number;
          quantity: number;
          status: VehicleStatus;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      drivers: {
        Row: {
          id: string;
          operator_id: string;
          profile_id: string | null;
          full_name: string;
          phone: string | null;
          license_number: string | null;
          status: DriverStatus;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      bookings: {
        Row: {
          id: string;
          reference: string;
          customer_profile_id: string;
          operator_id: string | null;
          vehicle_id: string | null;
          driver_id: string | null;
          accepted_quote_id: string | null;
          status: BookingStatus;
          trip_type: TripType;
          trip_intent: TripIntent | null;
          pickup_location_json: Record<string, unknown>;
          dropoff_location_json: Record<string, unknown>;
          distance_miles: number | null;
          drive_time_minutes: number | null;
          formatted_route_text: string | null;
          pickup_lat: number | null;
          pickup_lng: number | null;
          dropoff_lat: number | null;
          dropoff_lng: number | null;
          pickup_datetime_local: string;
          pickup_datetime_utc: string;
          return_datetime_local: string | null;
          return_datetime_utc: string | null;
          passengers: number;
          luggage_count: number;
          requested_vehicle_category: VehicleCategory | null;
          quoted_amount: number | null;
          final_amount: number | null;
          notes: string | null;
          concierge_trip: boolean;
          payment_intent_id: string | null;
          payment_status: PaymentStatus | null;
          completed_at: Timestamp | null;
          cancelled_at: Timestamp | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      booking_passengers: {
        Row: {
          id: string;
          booking_id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          seat_label: string | null;
          created_at: Timestamp;
        };
      };
      booking_stops: {
        Row: {
          id: string;
          booking_id: string;
          stop_order: number;
          location_json: Record<string, unknown>;
          created_at: Timestamp;
        };
      };
      quotes: {
        Row: {
          id: string;
          booking_id: string;
          operator_id: string | null;
          created_by_profile_id: string;
          source: "admin" | "operator" | "system";
          vehicle_category: VehicleCategory;
          vehicle_id: string | null;
          amount: number;
          deposit_amount: number | null;
          service_fee: number;
          notes: string | null;
          status: QuoteStatus;
          expires_at: Timestamp | null;
          accepted_at: Timestamp | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          quote_id: string | null;
          customer_profile_id: string;
          provider: PaymentProvider;
          payment_intent_id: string | null;
          payment_method_id: string | null;
          amount: number;
          currency: "usd";
          status: PaymentStatus;
          refund_amount: number | null;
          last_error: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      payouts: {
        Row: {
          id: string;
          booking_id: string;
          operator_id: string;
          provider: PayoutProvider;
          provider_transfer_id: string | null;
          gross_amount: number;
          platform_fee_amount: number;
          payout_amount: number;
          status: PayoutStatus;
          paid_at: Timestamp | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string | null;
          booking_id: string | null;
          quote_id: string | null;
          payout_id: string | null;
          type: string;
          title: string;
          message: string;
          channel: NotificationChannel;
          recipient: string;
          status: NotificationStatus;
          created_at: Timestamp;
          sent_at: Timestamp | null;
          read_at: Timestamp | null;
        };
      };
      support_threads: {
        Row: {
          id: string;
          booking_id: string | null;
          profile_id: string;
          subject: string;
          status: SupportThreadStatus;
          last_message_at: Timestamp;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_profile_id: string;
          operator_id: string;
          rating: number;
          title: string | null;
          body: string | null;
          status: ReviewStatus;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      pricing_rules: {
        Row: {
          id: string;
          operator_id: string | null;
          category: VehicleCategory;
          name: string;
          region: string;
          base_fare: number;
          rate_per_mile: number;
          minimum_fare: number;
          hourly_rate: number;
          minimum_hours: number;
          status: "active" | "inactive";
          created_at: Timestamp;
          updated_at: Timestamp;
        };
      };
      uploaded_documents: {
        Row: {
          id: string;
          profile_id: string | null;
          operator_id: string | null;
          driver_id: string | null;
          type: UploadedDocumentType;
          file_name: string;
          storage_path: string;
          mime_type: string;
          created_at: Timestamp;
        };
      };
    };
  };
}
