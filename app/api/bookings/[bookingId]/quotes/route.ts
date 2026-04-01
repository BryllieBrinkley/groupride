import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { createQuote } from "@/lib/services/quotes";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !["admin", "operator"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { bookingId } = await params;
    const body = (await request.json()) as {
      operatorId?: string;
      vehicleCategory: "suv" | "sprinter" | "minibus" | "charter_bus";
      vehicleId?: string;
      amount: number;
      notes?: string;
    };

    const quote = await createQuote({
      bookingId,
      actor: user,
      operatorId: body.operatorId ?? user.operatorId,
      vehicleCategory: body.vehicleCategory,
      vehicleId: body.vehicleId,
      amount: body.amount,
      notes: body.notes,
    });

    return NextResponse.json({ ok: true, quote });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create quote." },
      { status: 400 },
    );
  }
}
