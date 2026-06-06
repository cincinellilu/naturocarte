import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
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
  const redirectUrl = createAppUrl("/praticiens", request);

  try {
    const formData = await request.formData();
    const email = normalizeText(formData.get("email")).toLowerCase();

    if (!email || !isValidEmail(email)) {
      redirectUrl.searchParams.set("error", "invalid_email");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    redirectUrl.searchParams.set("email", email);
    const callbackRedirectTo = createAppUrl("/praticiens/auth/callback", request).toString();

    if (!process.env.RESEND_API_KEY?.trim() && canUseSupabaseAuthEmailFallback()) {
      const fallbackResult = await sendSupabaseMagicLink({
        email,
        redirectTo: callbackRedirectTo
      });

      if (!fallbackResult.ok) {
        console.error("practitioner fallback magic link send failed", fallbackResult.error);
        await recordProductEvent({
          eventName: "practitioner_login_link_failed",
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
        eventName: "practitioner_login_link_requested",
        request,
        metadata: { delivery_provider: "supabase_auth" }
      }).catch(() => {});
      return NextResponse.redirect(redirectUrl, { status: 303 });
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
        console.error("practitioner auth user creation failed", createUserError);
        redirectUrl.searchParams.set("error", "auth_failed");
        return NextResponse.redirect(redirectUrl, { status: 303 });
      }

      ({ data, error } = await createMagicLink());
    }

    const tokenHash = data.properties?.hashed_token;
    const verificationType = data.properties?.verification_type;
    if (error || !tokenHash || !verificationType) {
      console.error("practitioner magic link generation failed", error);
      redirectUrl.searchParams.set("error", "auth_failed");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    const callbackUrl = createAppUrl("/praticiens/auth/callback", request);
    callbackUrl.searchParams.set("token_hash", tokenHash);
    callbackUrl.searchParams.set("type", verificationType);
    const loginUrl = callbackUrl.toString();

    const result = await sendAuthMagicLinkEmail({
      audience: "practitioner",
      email,
      loginUrl
    });

    if (!result.ok) {
      console.error("practitioner magic link email send failed", result.error);

      if (canUseSupabaseAuthEmailFallback() && result.code !== "missing_provider") {
        const fallbackResult = await sendSupabaseMagicLink({
          email,
          redirectTo: callbackRedirectTo
        });

        if (!fallbackResult.ok) {
          console.error("practitioner fallback magic link send failed after resend error", {
            resend: result.error,
            supabase: fallbackResult.error
          });
          await recordProductEvent({
            eventName: "practitioner_login_link_failed",
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
          eventName: "practitioner_login_link_requested",
          request,
          metadata: {
            delivery_provider: "supabase_auth_fallback",
            primary_provider_error: result.code
          }
        }).catch(() => {});
        return NextResponse.redirect(redirectUrl, { status: 303 });
      }

      await recordProductEvent({
        eventName: "practitioner_login_link_failed",
        request,
        metadata: {
          reason: result.code,
          delivery_provider: "resend"
        }
      }).catch(() => {});
      redirectUrl.searchParams.set("error", mapAuthEmailErrorCodeToQueryParam(result.code));
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    redirectUrl.searchParams.set("auth", "sent");
    await recordProductEvent({
      eventName: "practitioner_login_link_requested",
      request,
      metadata: { delivery_provider: "resend" }
    }).catch(() => {});
    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (error) {
    console.error("practitioner magic link error", error);
    redirectUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }
}
