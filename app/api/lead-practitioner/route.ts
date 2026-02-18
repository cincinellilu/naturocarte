import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function insertLead(
  email: string,
  claim: string
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  const supabase = getSupabaseAdminClient();
  const payloads = [
    { email, claim: claim || null, source: "praticiens-form" },
    { email, claim: claim || null },
    { email }
  ];

  let lastError: unknown = null;

  for (const payload of payloads) {
    const { error } = await supabase.from("practitioner_leads").insert(payload);
    if (!error) {
      return { ok: true };
    }
    lastError = { tableName: "practitioner_leads", payloadKeys: Object.keys(payload), error };
  }

  return { ok: false, error: lastError };
}

export async function POST(request: Request) {
  const redirectUrl = new URL("/praticiens", request.url);

  try {
    const formData = await request.formData();
    const rawEmail = formData.get("email");
    const rawClaim = formData.get("claim");
    const rawCompany = formData.get("company");

    const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
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

    const result = await insertLead(email, claim);
    if (!result.ok) {
      console.error("lead-practitioner insert failed", result.error);
      redirectUrl.searchParams.set("error", "db_error");
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
