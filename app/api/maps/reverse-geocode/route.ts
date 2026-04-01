import { NextResponse } from "next/server";
import { z } from "zod";

import { reverseGeocodeCoordinates } from "@/lib/adapters/maps";

const reverseGeocodeSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const input = reverseGeocodeSchema.parse(body);
    const result = await reverseGeocodeCoordinates(input);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to reverse geocode coordinates.",
      },
      { status: 400 },
    );
  }
}
