import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import { recordProductEvent } from "@/lib/product-events-server";
import { getSupabaseAuthClient } from "@/lib/supabase-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendMagicLinkEmail(params: {
  email: string;
  loginUrl: string;
}): Promise<
  { ok: true } | { ok: false; code: "missing_provider" | "send_failed" | "rate_limited"; error: unknown }
> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim() || "NaturoCarte <onboarding@resend.dev>";

  if (!apiKey) {
    return { ok: false, code: "missing_provider", error: "Missing RESEND_API_KEY" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [params.email],
      subject: "Votre lien de connexion NaturoCarte",
      text: [
        "Bonjour,",
        "",
        "Voici votre lien de connexion à l’espace praticien NaturoCarte :",
        params.loginUrl,
        "",
        "Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet email."
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; color: #10201b; line-height: 1.55;">
          <p>Bonjour,</p>
          <p>Voici votre lien de connexion à l’espace praticien NaturoCarte.</p>
          <p>
            <a href="${escapeHtml(params.loginUrl)}" style="display: inline-block; padding: 12px 18px; border-radius: 8px; background: #0f766e; color: #ffffff; text-decoration: none; font-weight: 700;">
              Accéder à mon espace praticien
            </a>
          </p>
          <p style="color: #5f6f69;">Ce lien est personnel. Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet email.</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }

    return {
      ok: false,
      code: response.status === 429 ? "rate_limited" : "send_failed",
      error: { status: response.status, details }
    };
  }

  return { ok: true };
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

    if (!process.env.RESEND_API_KEY?.trim()) {
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

    const result = await sendMagicLinkEmail({
      email,
      loginUrl
    });

    if (!result.ok) {
      console.error("practitioner magic link email send failed", result.error);

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
