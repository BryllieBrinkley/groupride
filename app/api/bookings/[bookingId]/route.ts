import { NextResponse } from "next/server";

import { getBookingById } from "@/lib/services/bookings";

export async function GET(_: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const booking = getBookingById(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json(booking);
}
