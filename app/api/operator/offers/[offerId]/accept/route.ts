import { NextResponse } from "next/server";

import { acceptOffer } from "@/lib/services/bookings";
import { getSessionUser } from "@/lib/auth";

export async function POST(_: Request, { params }: { params: Promise<{ offerId: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "operator") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { offerId } = await params;
    const booking = await acceptOffer(offerId, user);
    return NextResponse.json({ status: booking.status, message: "Offer accepted." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to accept offer." },
      { status: 400 }
    );
  }
}
