import { NextResponse } from "next/server";
import { MANAGED_PROSPECT_STATUSES } from "@/lib/practitioner-status";
import { isPractitionerClaimed } from "@/lib/practitioner-public-contact";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const MAX_RESULTS = 8;

type ClaimSearchPayload = {
  first_name?: unknown;
  last_name?: unknown;
  email?: unknown;
};

type ClaimCandidateRow = {
  id: string;
  slug: string;
  first_name: string | null;
  last_name: string | null;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  email: string | null;
  practitioner_accounts: Array<{ id: string | null }> | { id: string | null } | null;
};

function normalizeText(value: unknown): string {
  return typeof value === "string"
    ? value
        .trim()
        .replace(/[%_]/g, "")
        .replace(/\s+/g, " ")
        .slice(0, 120)
    : "";
}

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 180) : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getAddressLine(candidate: ClaimCandidateRow): string {
  return [candidate.adresse, candidate.postal_code, candidate.city]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

function dedupeCandidates(rows: ClaimCandidateRow[]): ClaimCandidateRow[] {
  const byId = new Map<string, ClaimCandidateRow>();

  for (const row of rows) {
    if (!isPractitionerClaimed(row.practitioner_accounts)) {
      byId.set(row.id, row);
    }
  }

  return [...byId.values()].slice(0, MAX_RESULTS);
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ClaimSearchPayload;
  const firstName = normalizeText(payload.first_name);
  const lastName = normalizeText(payload.last_name);
  const email = normalizeEmail(payload.email);

  if (!firstName || !lastName || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "invalid_payload", candidates: [] },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const select =
    "id, slug, first_name, last_name, adresse, postal_code, city, email, practitioner_accounts(id)";
  const queries = [
    supabase
      .from("practitioners")
      .select(select)
      .in("status", [...MANAGED_PROSPECT_STATUSES])
      .ilike("first_name", firstName)
      .ilike("last_name", lastName)
      .limit(MAX_RESULTS),
    supabase
      .from("practitioners")
      .select(select)
      .in("status", [...MANAGED_PROSPECT_STATUSES])
      .ilike("first_name", lastName)
      .ilike("last_name", firstName)
      .limit(MAX_RESULTS),
    supabase
      .from("practitioners")
      .select(select)
      .in("status", [...MANAGED_PROSPECT_STATUSES])
      .ilike("email", email)
      .limit(MAX_RESULTS)
  ];

  const results = await Promise.all(queries);
  const firstError = results.find((result) => result.error)?.error;

  if (firstError) {
    console.error("practitioner claim search failed", firstError);
    return NextResponse.json({ error: "search_failed", candidates: [] }, { status: 500 });
  }

  const candidates = dedupeCandidates(
    results.flatMap((result) => (result.data ?? []) as ClaimCandidateRow[])
  );

  return NextResponse.json({
    candidates: candidates.map((candidate) => ({
      id: candidate.id,
      slug: candidate.slug,
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      address: getAddressLine(candidate),
      email: candidate.email?.trim() || null
    }))
  });
}

