import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { overrideBookingPrice } from "@/lib/services/bookings";
import { priceOverrideSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = priceOverrideSchema.parse(await request.json());
    const { bookingId } = await params;
    const quote = await overrideBookingPrice(bookingId, body, user);
    return NextResponse.json({ message: "Updated.", quote });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Price override failed." },
      { status: 400 },
    );
  }
}
