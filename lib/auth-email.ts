import { legalIdentity } from "@/lib/legal";
import { getServerEnv } from "@/lib/server-env";
import { getSiteUrl } from "@/lib/site";

type AuthEmailAudience = "user" | "practitioner";

type AuthEmailSendResult =
  | { ok: true }
  | { ok: false; code: "missing_provider" | "send_failed" | "rate_limited"; error: unknown };

const DEFAULT_FROM_EMAIL = "NaturoCarte <onboarding@resend.dev>";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getAuthEmailCopy(audience: AuthEmailAudience) {
  if (audience === "practitioner") {
    return {
      subject: "Votre lien de connexion espace praticien | NaturoCarte",
      title: "Connectez-vous à votre espace praticien",
      intro:
        "Utilisez le bouton ci-dessous pour accéder à votre espace praticien NaturoCarte et gérer votre fiche.",
      ctaLabel: "Accéder à mon espace praticien",
      preheader: "Votre lien de connexion praticien NaturoCarte est prêt."
    };
  }

  return {
    subject: "Votre lien de connexion compte | NaturoCarte",
    title: "Connectez-vous à votre compte",
    intro:
      "Utilisez le bouton ci-dessous pour accéder à votre compte NaturoCarte, retrouver vos favoris et gérer votre profil.",
    ctaLabel: "Accéder à mon compte",
    preheader: "Votre lien de connexion NaturoCarte est prêt."
  };
}

function buildAuthEmailText(params: {
  audience: AuthEmailAudience;
  loginUrl: string;
}) {
  const copy = getAuthEmailCopy(params.audience);

  return [
    "Bonjour,",
    "",
    copy.intro,
    "",
    params.loginUrl,
    "",
    "Ce lien est personnel et temporaire.",
    "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.",
    "",
    `Besoin d'aide ? ${legalIdentity.contactEmail}`
  ].join("\n");
}

function buildAuthEmailHtml(params: {
  audience: AuthEmailAudience;
  loginUrl: string;
}) {
  const copy = getAuthEmailCopy(params.audience);
  const escapedUrl = escapeHtml(params.loginUrl);
  const siteUrl = getSiteUrl();

  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f4f1e8;color:#10201b;font-family:Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(copy.preheader)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1e8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #d9e5df;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:40px;height:40px;border-radius:999px;background:#0f766e;color:#ffffff;font-size:20px;font-weight:700;text-align:center;">
                      N
                    </td>
                    <td style="padding-left:12px;font-size:22px;font-weight:700;color:#10201b;">
                      NaturoCarte
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px;">
                <p style="margin:0 0 10px;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;">
                  Connexion sécurisée
                </p>
                <h1 style="margin:0;font-size:32px;line-height:1.15;color:#10201b;">
                  ${escapeHtml(copy.title)}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 0;">
                <p style="margin:0;font-size:16px;line-height:1.7;color:#31443c;">
                  ${escapeHtml(copy.intro)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 12px;">
                <a
                  href="${escapedUrl}"
                  style="display:inline-block;padding:14px 22px;border-radius:12px;background:#0f766e;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;"
                >
                  ${escapeHtml(copy.ctaLabel)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#4f625a;">
                  Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
                </p>
                <p style="margin:12px 0 0;font-size:14px;line-height:1.7;word-break:break-word;">
                  <a href="${escapedUrl}" style="color:#0f766e;text-decoration:underline;">
                    ${escapedUrl}
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px;">
                <div style="padding:18px 20px;border-radius:18px;background:#f7fbf9;border:1px solid #d9e5df;">
                  <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#31443c;">
                    Ce lien est personnel et temporaire.
                  </p>
                  <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#31443c;">
                    Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
                  </p>
                  <p style="margin:0;font-size:14px;line-height:1.7;color:#31443c;">
                    Besoin d'aide ? <a href="mailto:${escapeHtml(legalIdentity.contactEmail)}" style="color:#0f766e;text-decoration:underline;">${escapeHtml(legalIdentity.contactEmail)}</a>
                  </p>
                </div>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#61746c;">
            NaturoCarte - <a href="${escapeHtml(siteUrl)}" style="color:#61746c;text-decoration:underline;">${escapeHtml(siteUrl)}</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function canUseSupabaseAuthEmailFallback(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function mapAuthEmailErrorCodeToQueryParam(
  code: "missing_provider" | "send_failed" | "rate_limited"
): "email_provider_missing" | "email_failed" | "email_rate_limited" {
  if (code === "missing_provider") return "email_provider_missing";
  if (code === "rate_limited") return "email_rate_limited";
  return "email_failed";
}

export async function sendAuthMagicLinkEmail(params: {
  audience: AuthEmailAudience;
  email: string;
  loginUrl: string;
}): Promise<AuthEmailSendResult> {
  const apiKey = getServerEnv("RESEND_API_KEY");
  const fromEmail = getServerEnv("CONTACT_FROM_EMAIL") || DEFAULT_FROM_EMAIL;
  const copy = getAuthEmailCopy(params.audience);

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
      subject: copy.subject,
      text: buildAuthEmailText(params),
      html: buildAuthEmailHtml(params)
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
