import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ensurePractitionerAccount, resolvePractitionerAccount } from "@/lib/auth-account-routing";
import {
  createPractitionerSessionCookieValue,
  getPractitionerSessionCookieOptions,
  PRACTITIONER_SESSION_COOKIE_NAME
} from "@/lib/practitioner-auth";
import { USER_SESSION_COOKIE_NAME } from "@/lib/user-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type PractitionerEmailOtpType = "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email";

const PRACTITIONER_EMAIL_OTP_TYPES = new Set<string>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email"
]);

function isPractitionerEmailOtpType(value: string | null): value is PractitionerEmailOtpType {
  return Boolean(value && PRACTITIONER_EMAIL_OTP_TYPES.has(value));
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  try {
    const supabase = getSupabaseAuthClient();
    const result =
      tokenHash && isPractitionerEmailOtpType(type)
        ? await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type
          })
        : code
          ? await supabase.auth.exchangeCodeForSession(code)
          : { data: null, error: new Error("missing_token") };

    const { data, error } = result;

    if (error || !data.user?.id || !data.user.email) {
      return NextResponse.redirect(new URL("/praticiens?error=auth_failed", request.url));
    }

    const normalizedEmail = data.user.email.toLowerCase();
    const admin = getSupabaseAdminClient();
    const practitionerResolution = await resolvePractitionerAccount(admin, {
      authUserId: data.user.id,
      email: normalizedEmail
    });

    if ("error" in practitionerResolution) {
      console.error("practitioner account resolution failed", practitionerResolution.error);
      return NextResponse.redirect(new URL("/praticiens?error=account_failed", request.url));
    }

    if (!practitionerResolution.isPractitioner) {
      const practitionerAccount = await ensurePractitionerAccount(admin, {
        authUserId: data.user.id,
        email: normalizedEmail
      });

      if (!practitionerAccount.ok) {
        console.error("practitioner account ensure failed", practitionerAccount.error);
        return NextResponse.redirect(new URL("/praticiens?error=account_failed", request.url));
      }
    }

    const response = NextResponse.redirect(new URL("/praticiens/dashboard", request.url));
    response.cookies.set({
      name: PRACTITIONER_SESSION_COOKIE_NAME,
      value: createPractitionerSessionCookieValue({
        userId: data.user.id,
        email: normalizedEmail
      }),
      ...getPractitionerSessionCookieOptions()
    });
    response.cookies.delete(USER_SESSION_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error("practitioner auth callback error", error);
    return NextResponse.redirect(new URL("/praticiens?error=server_error", request.url));
  }
}
