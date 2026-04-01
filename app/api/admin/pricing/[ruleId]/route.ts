import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { updatePricingRule } from "@/lib/services/bookings";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ruleId: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      baseFare?: number;
      ratePerMile?: number;
      minimumFare?: number;
      hourlyRate?: number;
      minimumHours?: number;
    };

    const { ruleId } = await params;
    const rule = updatePricingRule(ruleId, body);
    return NextResponse.json({ message: "Pricing saved.", rule });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update pricing." },
      { status: 400 },
    );
  }
}
