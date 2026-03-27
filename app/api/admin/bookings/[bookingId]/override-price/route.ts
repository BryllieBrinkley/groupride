import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { overrideBookingPrice } from "@/lib/services/bookings";
import { priceOverrideSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = priceOverrideSchema.parse(await request.json());
    const { bookingId } = await params;
    const booking = await overrideBookingPrice(bookingId, body, user);
    return NextResponse.json({ status: booking.status, message: "Customer approval requested." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to override booking price." },
      { status: 400 }
    );
  }
}
