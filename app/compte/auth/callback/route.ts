import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import {
  createPractitionerSessionCookieValue,
  getPractitionerSessionCookieOptions,
  PRACTITIONER_SESSION_COOKIE_NAME
} from "@/lib/practitioner-auth";
import {
  createUserSessionCookieValue,
  getUserSessionCookieOptions,
  parseUserAuthIntentCookie,
  USER_AUTH_INTENT_COOKIE_NAME,
  USER_SESSION_COOKIE_NAME
} from "@/lib/user-auth";
import { ensureUserAccount, resolvePractitionerAccount } from "@/lib/auth-account-routing";
import { recordProductEvent } from "@/lib/product-events-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type EmailOtpType = "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email";

const EMAIL_OTP_TYPES = new Set<string>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email"
]);

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return Boolean(value && EMAIL_OTP_TYPES.has(value));
}

function getSupabaseAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase auth environment variables.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function getSafeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/compte";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  try {
    const supabase = getSupabaseAuthClient();
    const result =
      tokenHash && isEmailOtpType(type)
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : code
          ? await supabase.auth.exchangeCodeForSession(code)
          : { data: null, error: new Error("missing_token") };

    const { data, error } = result;

    if (error || !data.user?.id || !data.user.email) {
      await recordProductEvent({
        eventName: "user_login_failed",
        request,
        metadata: { reason: "auth_failed" }
      }).catch(() => {});
      return NextResponse.redirect(new URL("/compte?error=auth_failed", request.url));
    }

    const cookieStore = await cookies();
    const intent = cookieStore.get(USER_AUTH_INTENT_COOKIE_NAME)?.value
      ? parseUserAuthIntentCookie(cookieStore.get(USER_AUTH_INTENT_COOKIE_NAME)?.value ?? "")
      : null;
    const normalizedEmail = data.user.email.toLowerCase();
    const shouldUseIntent = intent?.email.toLowerCase() === normalizedEmail;

    const admin = getSupabaseAdminClient();
    const practitionerResolution = await resolvePractitionerAccount(admin, {
      authUserId: data.user.id,
      email: normalizedEmail
    });

    if ("error" in practitionerResolution) {
      console.error("practitioner account resolution failed", practitionerResolution.error);
      return NextResponse.redirect(new URL("/compte?error=account_failed", request.url));
    }

    if (practitionerResolution.isPractitioner) {
      await recordProductEvent({
        eventName: "practitioner_login_success",
        request,
        metadata: { entry: "user_callback" }
      }).catch(() => {});
      const response = NextResponse.redirect(new URL("/praticiens/dashboard", request.url));
      response.cookies.set({
        name: PRACTITIONER_SESSION_COOKIE_NAME,
        value: createPractitionerSessionCookieValue({ userId: data.user.id, email: normalizedEmail }),
        ...getPractitionerSessionCookieOptions()
      });
      response.cookies.delete(USER_SESSION_COOKIE_NAME);
      response.cookies.delete(USER_AUTH_INTENT_COOKIE_NAME);

      return response;
    }

    const userAccount = await ensureUserAccount(admin, {
      authUserId: data.user.id,
      email: normalizedEmail
    });

    if (!userAccount.ok) {
      console.error("user account ensure failed", userAccount.error);
      return NextResponse.redirect(new URL("/compte?error=account_failed", request.url));
    }

    const response = NextResponse.redirect(new URL(getSafeNextPath(shouldUseIntent ? intent?.nextPath : null), request.url));
    await recordProductEvent({
      eventName: "user_login_success",
      request,
      metadata: {
        next_path: getSafeNextPath(shouldUseIntent ? intent?.nextPath : null)
      }
    }).catch(() => {});
    response.cookies.set({
      name: USER_SESSION_COOKIE_NAME,
      value: createUserSessionCookieValue({ userId: data.user.id, email: normalizedEmail }),
      ...getUserSessionCookieOptions()
    });
    response.cookies.delete(PRACTITIONER_SESSION_COOKIE_NAME);
    response.cookies.delete(USER_AUTH_INTENT_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error("user auth callback error", error);
    return NextResponse.redirect(new URL("/compte?error=server_error", request.url));
  }
}
