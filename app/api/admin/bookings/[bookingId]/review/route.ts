import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { reviewBooking } from "@/lib/services/bookings";
import { adminReviewSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = adminReviewSchema.parse(await request.json());
    const { bookingId } = await params;
    const booking = await reviewBooking(bookingId, body, user);
    return NextResponse.json({ message: "Booking updated.", booking });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update booking." },
      { status: 400 },
    );
  }
}
