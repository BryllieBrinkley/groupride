import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { acceptQuote } from "@/lib/services/quotes";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ quoteId: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { quoteId } = await params;
    const result = await acceptQuote({ quoteId, customerProfileId: user.profileId });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to accept quote." },
      { status: 400 },
    );
  }
}
