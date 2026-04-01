import { NextResponse } from "next/server";

import { createBookingRequest } from "@/lib/services/bookings";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createBookingRequest(body);
    return NextResponse.json({ ok: true, booking: result.booking });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create booking." },
      { status: 400 },
    );
  }
}
