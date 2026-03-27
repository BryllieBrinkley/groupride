import { NextResponse } from "next/server";

import { approvePriceOverride } from "@/lib/services/bookings";
import { tokenSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  try {
    const body = tokenSchema.parse(await request.json());
    const { bookingId } = await params;
    const booking = await approvePriceOverride(bookingId, body.token);
    return NextResponse.json({ status: booking.status, message: "Revised quote approved." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to approve revised quote." },
      { status: 400 }
    );
  }
}
