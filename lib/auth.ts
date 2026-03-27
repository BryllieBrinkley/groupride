import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getStore } from "@/lib/data/demo-store";
import type { AppUser, Role, SessionUser } from "@/lib/types";
import { loginSchema } from "@/lib/validation";

const SESSION_COOKIE = "gr_session";

function toSessionUser(user: AppUser): SessionUser {
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    operatorId: user.operatorId
  };
}

export function authenticateUser(input: { email: string; password: string }) {
  const values = loginSchema.parse(input);
  const store = getStore();
  const user = store.users.find(
    (entry) => entry.email.toLowerCase() === values.email.toLowerCase() && entry.password === values.password
  );

  return user ? toSessionUser(user) : null;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, Buffer.from(JSON.stringify(user)).toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireRole(roles: Role[]) {
  const user = await getSessionUser();
  if (!user || !roles.includes(user.role)) {
    redirect("/login");
  }

  return user;
}
