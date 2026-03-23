import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_PROSPECTS_COOKIE_NAME = "naturocarte_admin_prospects";

function getConfiguredAdminPassword(): string {
  return process.env.ADMIN_PROSPECTS_PASSWORD?.trim() ?? "";
}

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

export function isAdminProspectsConfigured(): boolean {
  return Boolean(getConfiguredAdminPassword());
}

export function verifyAdminProspectsPassword(password: string): boolean {
  const configuredPassword = getConfiguredAdminPassword();
  if (!configuredPassword) return false;

  return safeEqual(hashAdminPassword(password.trim()), hashAdminPassword(configuredPassword));
}

export function getAdminProspectsSessionValue(): string | null {
  const configuredPassword = getConfiguredAdminPassword();
  if (!configuredPassword) return null;

  return hashAdminPassword(configuredPassword);
}

export async function hasAdminProspectsAccess(): Promise<boolean> {
  const expectedSessionValue = getAdminProspectsSessionValue();
  if (!expectedSessionValue) return false;

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_PROSPECTS_COOKIE_NAME)?.value ?? "";

  return safeEqual(sessionValue, expectedSessionValue);
}
