import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import {
  createUserAuthIntentCookieValue,
  getUserAuthIntentCookieOptions,
  USER_AUTH_INTENT_COOKIE_NAME
} from "@/lib/user-auth";
import { recordProductEvent } from "@/lib/product-events-server";
import {
  canUseSupabaseAuthEmailFallback,
  mapAuthEmailErrorCodeToQueryParam,
  sendAuthMagicLinkEmail
} from "@/lib/auth-email";
import { getSupabaseAuthClient } from "@/lib/supabase-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function getSafeNextPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/compte";
  return value;
}

async function sendSupabaseMagicLink(params: {
  email: string;
  redirectTo: string;
}): Promise<{ ok: true } | { ok: false; code: "send_failed" | "rate_limited"; error: unknown }> {
  const supabase = getSupabaseAuthClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: params.email,
    options: {
      emailRedirectTo: params.redirectTo,
      shouldCreateUser: true
    }
  });

  if (error) {
    return {
      ok: false,
      code: error.status === 429 || error.code === "over_email_send_rate_limit"
        ? "rate_limited"
        : "send_failed",
      error
    };
  }

  return { ok: true };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = normalizeText(formData.get("email")).toLowerCase();
  const nextPath = getSafeNextPath(normalizeText(formData.get("next")) || "/compte");
  const redirectUrl = createAppUrl("/compte", request);
  redirectUrl.searchParams.set("next", nextPath);
  const callbackRedirectTo = createAppUrl("/compte/auth/callback", request).toString();

  if (!email || !isValidEmail(email)) {
    redirectUrl.searchParams.set("error", "invalid_email");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  try {
    if (!process.env.RESEND_API_KEY?.trim() && canUseSupabaseAuthEmailFallback()) {
      const fallbackResult = await sendSupabaseMagicLink({
        email,
        redirectTo: callbackRedirectTo
      });

      if (!fallbackResult.ok) {
        console.error("user fallback magic link send failed", fallbackResult.error);
        await recordProductEvent({
          eventName: "user_login_link_failed",
          request,
          metadata: { reason: "supabase_fallback_failed" }
        }).catch(() => {});
        redirectUrl.searchParams.set(
          "error",
          fallbackResult.code === "rate_limited" ? "email_rate_limited" : "email_failed"
        );
        return NextResponse.redirect(redirectUrl, { status: 303 });
      }

      redirectUrl.searchParams.set("auth", "sent");
      await recordProductEvent({
        eventName: "user_login_link_requested",
        request,
        metadata: {
          next_path: nextPath,
          delivery_provider: "supabase_auth"
        }
      }).catch(() => {});
      const response = NextResponse.redirect(redirectUrl, { status: 303 });
      response.cookies.set({
        name: USER_AUTH_INTENT_COOKIE_NAME,
        value: createUserAuthIntentCookieValue({ email, nextPath }),
        ...getUserAuthIntentCookieOptions()
      });

      return response;
    }

    const supabase = getSupabaseAdminClient();
    const createMagicLink = () =>
      supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: callbackRedirectTo
        }
      });

    let { data, error } = await createMagicLink();

    if (error || !data.properties?.hashed_token) {
      const { error: createUserError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true
      });

      if (createUserError) {
        console.error("user auth creation failed", createUserError);
        redirectUrl.searchParams.set("error", "auth_failed");
        return NextResponse.redirect(redirectUrl, { status: 303 });
      }

      ({ data, error } = await createMagicLink());
    }

    const tokenHash = data.properties?.hashed_token;
    const verificationType = data.properties?.verification_type;
    if (error || !tokenHash || !verificationType) {
      console.error("user magic link generation failed", error);
      redirectUrl.searchParams.set("error", "auth_failed");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    const callbackUrl = createAppUrl("/compte/auth/callback", request);
    callbackUrl.searchParams.set("token_hash", tokenHash);
    callbackUrl.searchParams.set("type", verificationType);
    const loginUrl = callbackUrl.toString();

    const result = await sendAuthMagicLinkEmail({
      audience: "user",
      email,
      loginUrl
    });

    if (!result.ok) {
      console.error("user magic link email send failed", result.error);

      if (canUseSupabaseAuthEmailFallback() && result.code !== "missing_provider") {
        const fallbackResult = await sendSupabaseMagicLink({
          email,
          redirectTo: callbackRedirectTo
        });

        if (!fallbackResult.ok) {
          console.error("user fallback magic link send failed after resend error", {
            resend: result.error,
            supabase: fallbackResult.error
          });
          await recordProductEvent({
            eventName: "user_login_link_failed",
            request,
            metadata: {
              reason: fallbackResult.code,
              primary_provider: "resend",
              fallback_provider: "supabase_auth"
            }
          }).catch(() => {});
          redirectUrl.searchParams.set(
            "error",
            fallbackResult.code === "rate_limited" ? "email_rate_limited" : "email_failed"
          );
          return NextResponse.redirect(redirectUrl, { status: 303 });
        }

        redirectUrl.searchParams.set("auth", "sent");
        await recordProductEvent({
          eventName: "user_login_link_requested",
          request,
          metadata: {
            next_path: nextPath,
            delivery_provider: "supabase_auth_fallback",
            primary_provider_error: result.code
          }
        }).catch(() => {});
        const fallbackResponse = NextResponse.redirect(redirectUrl, { status: 303 });
        fallbackResponse.cookies.set({
          name: USER_AUTH_INTENT_COOKIE_NAME,
          value: createUserAuthIntentCookieValue({ email, nextPath }),
          ...getUserAuthIntentCookieOptions()
        });

        return fallbackResponse;
      }

      await recordProductEvent({
        eventName: "user_login_link_failed",
        request,
        metadata: {
          next_path: nextPath,
          reason: result.code,
          delivery_provider: "resend"
        }
      }).catch(() => {});
      redirectUrl.searchParams.set("error", mapAuthEmailErrorCodeToQueryParam(result.code));
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    redirectUrl.searchParams.set("auth", "sent");
    await recordProductEvent({
      eventName: "user_login_link_requested",
      request,
      metadata: {
        next_path: nextPath,
        delivery_provider: "resend"
      }
    }).catch(() => {});
    const response = NextResponse.redirect(redirectUrl, { status: 303 });
    response.cookies.set({
      name: USER_AUTH_INTENT_COOKIE_NAME,
      value: createUserAuthIntentCookieValue({ email, nextPath }),
      ...getUserAuthIntentCookieOptions()
    });

    return response;
  } catch (error) {
    console.error("user magic link error", error);
    redirectUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }
}
