import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { reviewBooking } from "@/lib/services/bookings";
import { adminReviewSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = adminReviewSchema.parse(await request.json());
    const { bookingId } = await params;
    const booking = await reviewBooking(bookingId, body, user);
    return NextResponse.json({ status: booking.status, message: "Booking updated." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to review booking." },
      { status: 400 }
    );
  }
}
