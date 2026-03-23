import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_PROSPECTS_COOKIE_NAME = "naturocarte_admin_prospects";
const FALLBACK_ADMIN_PASSWORD_HASH =
  "6fbe88b2178fcdaf39607596ac049160450416d50a6ab745bf0be1cbaa13172b";

function hashAdminPassword(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getConfiguredAdminPasswordHash(): string {
  const passwordFromEnv = process.env.ADMIN_PROSPECTS_PASSWORD?.trim();

  if (passwordFromEnv) {
    return hashAdminPassword(passwordFromEnv);
  }

  return FALLBACK_ADMIN_PASSWORD_HASH;
}

export function isAdminProspectsConfigured(): boolean {
  return Boolean(getConfiguredAdminPasswordHash());
}

export function verifyAdminProspectsPassword(password: string): boolean {
  const configuredPasswordHash = getConfiguredAdminPasswordHash();
  if (!configuredPasswordHash) return false;

  return safeEqual(hashAdminPassword(password.trim()), configuredPasswordHash);
}

export function getAdminProspectsSessionValue(): string | null {
  const configuredPasswordHash = getConfiguredAdminPasswordHash();
  if (!configuredPasswordHash) return null;

  return configuredPasswordHash;
}

export async function hasAdminProspectsAccess(): Promise<boolean> {
  const expectedSessionValue = getAdminProspectsSessionValue();
  if (!expectedSessionValue) return false;

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_PROSPECTS_COOKIE_NAME)?.value ?? "";

  return safeEqual(sessionValue, expectedSessionValue);
}
