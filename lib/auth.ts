import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getProfileById, authenticateProfile } from "@/lib/services/auth";
import type { LoginInput, Profile, Role, SessionUser } from "@/lib/types";
import { loginSchema } from "@/lib/validation";

export const SESSION_COOKIE = "gr_session";

function encodeSession(session: SessionUser) {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

function decodeSession(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export function getDashboardPathForRole(role: Role) {
  if (role === "admin") return "/admin";
  if (role === "operator") return "/operator";
  return "/account";
}

export function authenticateUser(input: LoginInput) {
  const values = loginSchema.parse(input);
  return authenticateProfile(values);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  return decodeSession(raw);
}

export async function getSessionUser() {
  return getCurrentUser();
}

export async function getProfile(profileId?: string): Promise<Profile | null> {
  if (profileId) {
    return getProfileById(profileId);
  }

  const user = await getCurrentUser();
  return user ? getProfileById(user.profileId) : null;
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect(getDashboardPathForRole(user.role));
  }
  return user;
}
