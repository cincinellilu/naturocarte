import { NextResponse } from "next/server";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type SubjectType = "callback" | "subscription" | "question";

function isValidSubjectType(value: string): value is SubjectType {
  return value === "callback" || value === "subscription" || value === "question";
}

function getSubjectLabel(subjectType: SubjectType): string {
  if (subjectType === "callback") return "Je souhaite être recontacté";
  if (subjectType === "subscription") return "Je souhaite demander ma souscription";
  return "J'ai une question à poser";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendContactEmail(params: {
  fullName: string;
  email: string;
  phone: string;
  subjectType: SubjectType;
  customSubject: string;
  message: string;
  claim: string;
}): Promise<{ ok: true } | { ok: false; error: unknown }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim() || "NaturoCarte <onboarding@resend.dev>";

  if (!apiKey) {
    return { ok: false, error: "Missing RESEND_API_KEY" };
  }

  const subjectPrefix = getSubjectLabel(params.subjectType);
  const finalSubject =
    params.subjectType === "question" && params.customSubject
      ? `${subjectPrefix} - ${params.customSubject}`
      : subjectPrefix;

  const textLines = [
    "Nouveau message depuis la page praticiens.",
    "",
    `Nom: ${params.fullName}`,
    `Email: ${params.email}`,
    params.phone ? `Téléphone: ${params.phone}` : "",
    `Sujet: ${finalSubject}`,
    params.claim ? `Fiche concernée: ${params.claim}` : "",
    "",
    "Message:",
    params.message
  ].filter(Boolean);

  const html = `
    <p><strong>Nouveau message depuis la page praticiens.</strong></p>
    <p><strong>Nom:</strong> ${escapeHtml(params.fullName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(params.email)}</p>
    ${params.phone ? `<p><strong>Téléphone:</strong> ${escapeHtml(params.phone)}</p>` : ""}
    <p><strong>Sujet:</strong> ${escapeHtml(finalSubject)}</p>
    ${
      params.claim
        ? `<p><strong>Fiche concernée:</strong> ${escapeHtml(params.claim)}</p>`
        : ""
    }
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(params.message).replaceAll("\n", "<br />")}</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: ["lcincinelli@osezone.com"],
      reply_to: params.email,
      subject: `[NaturoCarte] ${finalSubject}`,
      text: textLines.join("\n"),
      html
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
      error: { status: response.status, details }
    };
  }

  return { ok: true };
}

export async function POST(request: Request) {
  const redirectUrl = new URL("/praticiens", request.url);

  try {
    const formData = await request.formData();
    const rawEmail = formData.get("email");
    const rawFullName = formData.get("full_name");
    const rawSubjectType = formData.get("subject_type");
    const rawPhone = formData.get("phone");
    const rawCustomSubject = formData.get("custom_subject");
    const rawMessage = formData.get("message");
    const rawClaim = formData.get("claim");
    const rawCompany = formData.get("company");

    const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
    const fullName = typeof rawFullName === "string" ? rawFullName.trim() : "";
    const subjectType = typeof rawSubjectType === "string" ? rawSubjectType.trim() : "";
    const phone = typeof rawPhone === "string" ? rawPhone.trim() : "";
    const customSubject = typeof rawCustomSubject === "string" ? rawCustomSubject.trim() : "";
    const message = typeof rawMessage === "string" ? rawMessage.trim() : "";
    const claim = typeof rawClaim === "string" ? rawClaim.trim() : "";
    const company = typeof rawCompany === "string" ? rawCompany.trim() : "";

    if (claim) {
      redirectUrl.searchParams.set("claim", claim);
    }

    if (company) {
      redirectUrl.searchParams.set("submitted", "1");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    if (!email || !isValidEmail(email)) {
      redirectUrl.searchParams.set("error", "invalid_email");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    if (!fullName || !message || !isValidSubjectType(subjectType)) {
      redirectUrl.searchParams.set("error", "invalid_subject");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    if (subjectType === "question" && !customSubject) {
      redirectUrl.searchParams.set("error", "missing_subject");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    if (subjectType === "callback" && !phone) {
      redirectUrl.searchParams.set("error", "missing_phone");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    const result = await sendContactEmail({
      fullName,
      email,
      phone,
      subjectType,
      customSubject,
      message,
      claim
    });

    if (!result.ok) {
      console.error("lead-practitioner email send failed", result.error);
      redirectUrl.searchParams.set("error", "server_error");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    redirectUrl.searchParams.set("submitted", "1");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (error) {
    console.error("lead-practitioner server error", error);
    redirectUrl.searchParams.set("error", "server_error");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }
}
