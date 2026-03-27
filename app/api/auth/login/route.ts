import { NextResponse } from "next/server";

import { authenticateUser, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email: string; password: string };
    const user = authenticateUser(body);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await setSession(user);

    const redirectTo =
      user.role === "admin" ? "/admin" : user.role === "operator" ? "/operator" : "/account";

    return NextResponse.json({ redirectTo });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to sign in." },
      { status: 400 }
    );
  }
}
