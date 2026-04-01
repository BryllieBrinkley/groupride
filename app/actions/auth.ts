"use server";

import { authenticateUser, clearSession, getDashboardPathForRole, setSession } from "@/lib/auth";

export async function loginAction(input: { email: string; password: string }) {
  const user = authenticateUser(input);
  if (!user) {
    return { ok: false as const, error: "Invalid email or password." };
  }

  await setSession(user);
  return { ok: true as const, redirectTo: getDashboardPathForRole(user.role) };
}

export async function logoutAction() {
  await clearSession();
  return { ok: true as const };
}
