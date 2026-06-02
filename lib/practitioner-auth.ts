import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const PRACTITIONER_SESSION_COOKIE_NAME = "naturocarte_practitioner_session";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type PractitionerSession = {
  userId: string;
  email: string;
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
    process.env.PRACTITIONER_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!secret) {
    throw new Error("Missing practitioner session secret.");
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

export function createPractitionerSessionCookieValue(params: {
  userId: string;
  email: string;
}): string {
  const session: PractitionerSession = {
    userId: params.userId,
    email: params.email,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000
  };
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function parsePractitionerSessionCookie(value: string): PractitionerSession | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = signPayload(payload);
  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as PractitionerSession;
    if (!parsed.userId || !parsed.email || parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getCurrentPractitionerSession(): Promise<PractitionerSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(PRACTITIONER_SESSION_COOKIE_NAME)?.value;
  if (!value) return null;

  return parsePractitionerSessionCookie(value);
}

export function getPractitionerSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  };
}
