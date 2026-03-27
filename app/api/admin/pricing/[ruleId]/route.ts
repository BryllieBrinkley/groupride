import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { updatePricingRule } from "@/lib/services/bookings";

export async function POST(request: Request, { params }: { params: Promise<{ ruleId: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { ruleId } = await params;
    const body = (await request.json()) as {
      baseFare?: number;
      ratePerMile?: number;
      minimumFare?: number;
      hourlyRate?: number;
      minimumHours?: number;
    };
    const rule = updatePricingRule(ruleId, body);
    return NextResponse.json({ rule, message: "Pricing updated." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update pricing." },
      { status: 400 }
    );
  }
}
