import { NextResponse } from "next/server";
import { hasAdminProspectsAccess } from "@/lib/admin-prospects-auth";
import { linkPractitionerCabinets } from "@/lib/practitioner-cabinet-linking";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function normalizeSlugToken(value: string): string {
  const raw = value.trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const segments = url.pathname.split("/").filter(Boolean);
    if (segments[0] === "naturopathe" && segments[1]) {
      return segments[1].trim();
    }
    return segments[segments.length - 1]?.trim() ?? "";
  } catch {
    const normalized = raw.replace(/^https?:\/\//i, "").replace(/^\/+|\/+$/g, "");
    const segments = normalized.split("/").filter(Boolean);
    if (segments[0]?.includes("naturocarte.fr")) {
      if (segments[1] === "naturopathe" && segments[2]) {
        return segments[2].trim();
      }
      return segments[segments.length - 1]?.trim() ?? "";
    }
    if (segments[0] === "naturopathe" && segments[1]) {
      return segments[1].trim();
    }
    return segments[segments.length - 1]?.trim() ?? "";
  }
}

function parseSlugs(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? normalizeSlugToken(item) : ""))
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  return value
    .split(/[\n,]+/)
    .map((item) => normalizeSlugToken(item))
    .filter(Boolean);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const hasAccess = await hasAdminProspectsAccess();

  if (!hasAccess) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      loginEmail?: unknown;
      slugs?: unknown;
      apply?: unknown;
    };

    const loginEmail = typeof body.loginEmail === "string" ? body.loginEmail.trim().toLowerCase() : "";
    const slugs = parseSlugs(body.slugs);
    const apply = body.apply === true;

    if (!isValidEmail(loginEmail)) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    if (slugs.length < 2) {
      return NextResponse.json(
        { error: "Renseignez au minimum 2 slugs à rattacher." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const result = await linkPractitionerCabinets(supabase, {
      loginEmail,
      slugs,
      apply
    });

    return NextResponse.json({
      ok: result.conflicts.length === 0,
      result
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur serveur."
      },
      { status: 500 }
    );
  }
}
