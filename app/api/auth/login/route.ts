import { NextResponse } from "next/server";

import { authenticateUser, getDashboardPathForRole, setSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const user = authenticateUser({
    email: body.email ?? "",
    password: body.password ?? "",
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await setSession(user);
  return NextResponse.json({ ok: true, user, redirectTo: getDashboardPathForRole(user.role) });
}
