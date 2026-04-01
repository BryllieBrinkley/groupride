import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { confirmBookingPayment } from "@/lib/services/bookings";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { bookingId } = await params;
    const result = await confirmBookingPayment(bookingId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to confirm payment." },
      { status: 400 },
    );
  }
}
