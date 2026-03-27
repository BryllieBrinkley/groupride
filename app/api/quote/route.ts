import { NextResponse } from "next/server";

import { quoteBooking } from "@/lib/services/bookings";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const quote = await quoteBooking(payload);
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to quote trip." },
      { status: 400 }
    );
  }
}
