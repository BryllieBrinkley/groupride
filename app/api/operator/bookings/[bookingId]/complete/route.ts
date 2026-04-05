import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getBookingById, markBookingCompleted } from "@/lib/services/bookings";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "operator" || !user.operatorId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { bookingId } = await params;
    const result = getBookingById(bookingId);
    if (!result?.booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (result.booking.operatorId !== user.operatorId) {
      return NextResponse.json({ error: "You can only update your assigned trips." }, { status: 403 });
    }

    const booking = markBookingCompleted(bookingId);
    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to mark trip as completed." },
      { status: 400 },
    );
  }
}
