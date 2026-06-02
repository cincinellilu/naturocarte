import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const USER_SESSION_COOKIE_NAME = "naturocarte_user_session";
export const USER_AUTH_INTENT_COOKIE_NAME = "naturocarte_user_auth_intent";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const INTENT_TTL_SECONDS = 60 * 15;

export type UserSession = {
  userId: string;
  email: string;
  expiresAt: number;
};

export type UserAuthIntent = {
  email: string;
  nextPath: string;
  expiresAt: number;
};

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret(): string {
  const secret =
    process.env.USER_SESSION_SECRET?.trim() ||
    process.env.PRACTITIONER_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!secret) {
    throw new Error("Missing user session secret.");
  }

  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function createSignedValue(value: unknown): string {
  const payload = base64UrlEncode(JSON.stringify(value));
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

function parseSignedValue<T>(value: string): T | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = signPayload(payload);
  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    return JSON.parse(base64UrlDecode(payload)) as T;
  } catch {
    return null;
  }
}

export function createUserSessionCookieValue(params: { userId: string; email: string }): string {
  return createSignedValue({
    userId: params.userId,
    email: params.email,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000
  } satisfies UserSession);
}

export function parseUserSessionCookie(value: string): UserSession | null {
  const parsed = parseSignedValue<UserSession>(value);
  if (!parsed?.userId || !parsed.email || parsed.expiresAt < Date.now()) return null;

  return parsed;
}

export async function getCurrentUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(USER_SESSION_COOKIE_NAME)?.value;
  if (!value) return null;

  return parseUserSessionCookie(value);
}

export function getUserSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  };
}

export function createUserAuthIntentCookieValue(params: {
  email: string;
  nextPath: string;
}): string {
  return createSignedValue({
    email: params.email,
    nextPath: params.nextPath,
    expiresAt: Date.now() + INTENT_TTL_SECONDS * 1000
  } satisfies UserAuthIntent);
}

export function parseUserAuthIntentCookie(value: string): UserAuthIntent | null {
  const parsed = parseSignedValue<UserAuthIntent>(value);
  if (!parsed?.email || parsed.expiresAt < Date.now()) return null;

  return parsed;
}

export function getUserAuthIntentCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: INTENT_TTL_SECONDS
  };
}
