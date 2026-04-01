import { getStore } from "@/lib/data/demo-store";
import {
  getAdminDashboardMetrics,
  listAdminBookings,
  listCustomerBookings,
  listOperatorBookings,
  listOperatorOpportunities,
} from "@/lib/services/bookings";
import { listNotificationsForProfile } from "@/lib/services/notifications";
import { listPayoutsForOperator } from "@/lib/services/payouts";
import type { CustomerDashboardMetrics, OperatorDashboardMetrics } from "@/lib/types";

export function getCustomerDashboard(profileId: string) {
  const bookings = listCustomerBookings(profileId);
  const metrics: CustomerDashboardMetrics = {
    totalBookings: bookings.length,
    activeBookings: bookings.filter((booking) => ["pending", "quoted", "awaiting_payment", "confirmed", "assigned", "in_progress"].includes(booking.status)).length,
    completedBookings: bookings.filter((booking) => booking.status === "completed").length,
    totalSpend: bookings
      .filter((booking) => booking.status !== "cancelled")
      .reduce((sum, booking) => sum + (booking.finalAmount ?? booking.quotedAmount ?? 0), 0),
  };

  return {
    metrics,
    bookings,
    notifications: listNotificationsForProfile(profileId),
  };
}

export function getOperatorDashboard(operatorId: string, profileId: string) {
  const bookings = listOperatorBookings(operatorId);
  const opportunities = listOperatorOpportunities(operatorId);
  const payouts = listPayoutsForOperator(operatorId);
  const metrics: OperatorDashboardMetrics = {
    pendingQuotes: opportunities.filter((booking) => ["pending", "quoted"].includes(booking.status)).length,
    assignedTrips: bookings.filter((booking) => ["assigned", "in_progress"].includes(booking.status)).length,
    completedTrips: bookings.filter((booking) => booking.status === "completed").length,
    pendingPayouts: payouts.filter((payout) => ["pending", "in_transit"].includes(payout.status)).reduce((sum, payout) => sum + payout.payoutAmount, 0),
  };

  return {
    metrics,
    bookings,
    opportunities,
    payouts,
    notifications: listNotificationsForProfile(profileId),
  };
}

export function getAdminDashboard() {
  const metrics = getAdminDashboardMetrics();
  const store = getStore();
  return {
    metrics,
    bookings: listAdminBookings(),
    operators: store.operators,
    quotes: store.quotes,
    notifications: store.notifications,
  };
}
