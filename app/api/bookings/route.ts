import { NextResponse } from "next/server";

import { createBooking } from "@/lib/services/bookings";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const booking = await createBooking(payload);
    return NextResponse.json({
      bookingId: booking.id,
      status: booking.status
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create booking." },
      { status: 400 }
    );
  }
}
