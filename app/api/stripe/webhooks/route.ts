import { NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  return NextResponse.json({
    ok: true,
    received: true,
    hasSignature: Boolean(signature),
    webhookSecretConfigured: Boolean(env.stripeWebhookSecret),
    note: "Stripe webhook verification and event fan-out should be completed when live Stripe credentials are configured.",
  });
}
