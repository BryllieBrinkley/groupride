import { getStore } from "@/lib/data/demo-store";
import type { LoginInput, Profile, SessionUser } from "@/lib/types";

export function toSessionUser(profile: Profile): SessionUser {
  return {
    id: profile.id,
    profileId: profile.id,
    role: profile.role,
    email: profile.email,
    name: profile.fullName,
    operatorId: profile.defaultOperatorId,
  };
}

export function authenticateProfile(input: LoginInput): SessionUser | null {
  const store = getStore();
  const account = store.authAccounts.find(
    (entry) => entry.email.toLowerCase() === input.email.trim().toLowerCase() && entry.password === input.password,
  );

  if (!account) {
    return null;
  }

  const profile = store.profiles.find((entry) => entry.id === account.profileId && entry.status === "active");
  return profile ? toSessionUser(profile) : null;
}

export function getProfileById(profileId: string) {
  const store = getStore();
  return store.profiles.find((profile) => profile.id === profileId) ?? null;
}

export function getProfileByEmail(email: string) {
  const store = getStore();
  return store.profiles.find((profile) => profile.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function listProfiles() {
  return [...getStore().profiles];
}
