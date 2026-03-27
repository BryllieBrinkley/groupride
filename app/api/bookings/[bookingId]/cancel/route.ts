import { NextResponse } from "next/server";

import { cancelBooking } from "@/lib/services/bookings";
import { getSessionUser } from "@/lib/auth";

export async function POST(_: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await params;
    const user = await getSessionUser();
    const booking = await cancelBooking(bookingId, user?.email ?? "guest");
    return NextResponse.json({ status: booking.status, message: "Booking updated." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to cancel booking." },
      { status: 400 }
    );
  }
}
