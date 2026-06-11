import { NextResponse } from "next/server";
import { hasAdminProspectsAccess } from "@/lib/admin-prospects-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const TABLES_BY_PRACTITIONER_ID = [
  "user_favorite_practitioners",
  "practitioner_reviews",
  "practitioner_profile_stats",
  "product_events",
  "practitioner_claim_campaign_emails",
  "marketing_email_events",
  "marketing_email_recipients",
  "marketing_email_suppressions"
] as const;

type PractitionerRow = {
  id: string;
  slug: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  status: string | null;
};

type PractitionerAccountRow = {
  id: string;
  auth_user_id: string | null;
  practitioner_id: string | null;
  email: string | null;
  plan: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  created_at: string | null;
};

type ChildCounts = Record<string, number>;

type ErasureCandidate = {
  practitioner: PractitionerRow;
  accounts: PractitionerAccountRow[];
  childCounts: ChildCounts;
};

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildExclusionEntry(params: {
  practitioner: PractitionerRow;
  email: string;
  deletedAt: string;
}) {
  return {
    type: "practitioner_rgpd_erasure",
    source: "admin",
    reason: "rgpd_erasure",
    requested_at: params.deletedAt,
    deleted_at: params.deletedAt,
    slugs: params.practitioner.slug ? [params.practitioner.slug] : [],
    emails: [params.email],
    phones: params.practitioner.phone ? [params.practitioner.phone] : []
  };
}

async function countByColumn(table: string, column: string, value: string): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, value);

  if (error) throw error;
  return count ?? 0;
}

async function deleteByColumn(table: string, column: string, value: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from(table).delete().eq(column, value);
  if (error) throw error;
}

async function loadAccountsByPractitionerId(practitionerId: string): Promise<PractitionerAccountRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("practitioner_accounts")
    .select(
      "id, auth_user_id, practitioner_id, email, plan, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, created_at"
    )
    .eq("practitioner_id", practitionerId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PractitionerAccountRow[];
}

async function auditChildRows(practitionerId: string, accountIds: string[]): Promise<ChildCounts> {
  const counts: ChildCounts = {};

  for (const table of TABLES_BY_PRACTITIONER_ID) {
    counts[`${table}.practitioner_id`] = await countByColumn(table, "practitioner_id", practitionerId);
  }

  for (const accountId of accountIds) {
    counts[`product_events.practitioner_account_id:${accountId}`] = await countByColumn(
      "product_events",
      "practitioner_account_id",
      accountId
    );
  }

  counts["practitioner_accounts.practitioner_id"] = accountIds.length;
  return counts;
}

async function loadPractitionersByIds(ids: string[]): Promise<PractitionerRow[]> {
  if (ids.length === 0) return [];

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("practitioners")
    .select("id, slug, first_name, last_name, email, phone, adresse, postal_code, city, status")
    .in("id", ids);

  if (error) throw error;
  return (data ?? []) as PractitionerRow[];
}

async function loadCandidatesByEmail(email: string): Promise<ErasureCandidate[]> {
  const supabase = getSupabaseAdminClient();
  const { data: practitionerRows, error: practitionerError } = await supabase
    .from("practitioners")
    .select("id, slug, first_name, last_name, email, phone, adresse, postal_code, city, status")
    .ilike("email", email);

  if (practitionerError) throw practitionerError;

  const { data: accountRows, error: accountError } = await supabase
    .from("practitioner_accounts")
    .select(
      "id, auth_user_id, practitioner_id, email, plan, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, created_at"
    )
    .ilike("email", email);

  if (accountError) throw accountError;

  const practitionersById = new Map<string, PractitionerRow>();
  for (const practitioner of (practitionerRows ?? []) as PractitionerRow[]) {
    practitionersById.set(practitioner.id, practitioner);
  }

  const accountPractitionerIds = [
    ...new Set(
      ((accountRows ?? []) as PractitionerAccountRow[])
        .map((account) => account.practitioner_id)
        .filter((id): id is string => Boolean(id))
    )
  ].filter((id) => !practitionersById.has(id));

  for (const practitioner of await loadPractitionersByIds(accountPractitionerIds)) {
    practitionersById.set(practitioner.id, practitioner);
  }

  const candidates = await Promise.all(
    [...practitionersById.values()].map(async (practitioner) => {
      const accounts = await loadAccountsByPractitionerId(practitioner.id);
      const childCounts = await auditChildRows(
        practitioner.id,
        accounts.map((account) => account.id)
      );

      return {
        practitioner,
        accounts,
        childCounts
      };
    })
  );

  return candidates.sort((left, right) => {
    const leftLabel = `${left.practitioner.last_name ?? ""} ${left.practitioner.first_name ?? ""}`;
    const rightLabel = `${right.practitioner.last_name ?? ""} ${right.practitioner.first_name ?? ""}`;
    return leftLabel.localeCompare(rightLabel, "fr");
  });
}

async function loadPractitionerById(practitionerId: string): Promise<PractitionerRow | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("practitioners")
    .select("id, slug, first_name, last_name, email, phone, adresse, postal_code, city, status")
    .eq("id", practitionerId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as PractitionerRow | null;
}

async function deletePractitionerCascade(practitionerId: string): Promise<{
  practitioner: PractitionerRow;
  accounts: PractitionerAccountRow[];
  childCounts: ChildCounts;
}> {
  const supabase = getSupabaseAdminClient();
  const practitioner = await loadPractitionerById(practitionerId);

  if (!practitioner) {
    throw new Error("Fiche introuvable.");
  }

  const accounts = await loadAccountsByPractitionerId(practitionerId);
  const accountIds = accounts.map((account) => account.id);
  const childCounts = await auditChildRows(practitionerId, accountIds);

  for (const table of TABLES_BY_PRACTITIONER_ID) {
    if ((childCounts[`${table}.practitioner_id`] ?? 0) > 0) {
      await deleteByColumn(table, "practitioner_id", practitionerId);
    }
  }

  for (const accountId of accountIds) {
    if ((childCounts[`product_events.practitioner_account_id:${accountId}`] ?? 0) > 0) {
      await deleteByColumn("product_events", "practitioner_account_id", accountId);
    }
  }

  if (accountIds.length > 0) {
    const { error } = await supabase.from("practitioner_accounts").delete().in("id", accountIds);
    if (error) throw error;
  }

  const { error: practitionerDeleteError } = await supabase
    .from("practitioners")
    .delete()
    .eq("id", practitionerId);

  if (practitionerDeleteError) throw practitionerDeleteError;

  return { practitioner, accounts, childCounts };
}

async function suppressMarketingEmail(params: {
  email: string;
  practitioner: PractitionerRow;
  deletedAt: string;
}): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("marketing_email_suppressions").upsert({
    email: params.email,
    reason: "manual",
    source: "admin_rgpd_erasure",
    practitioner_id: null,
    details: {
      reason: "rgpd_erasure",
      deleted_practitioner_id: params.practitioner.id,
      deleted_practitioner_slug: params.practitioner.slug,
      deleted_at: params.deletedAt
    },
    updated_at: params.deletedAt
  });

  if (error) throw error;
}

export async function GET(request: Request) {
  const hasAccess = await hasAdminProspectsAccess();
  if (!hasAccess) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  const email = normalizeEmail(new URL(request.url).searchParams.get("email"));
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  try {
    const candidates = await loadCandidatesByEmail(email);
    return NextResponse.json({ email, candidates });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recherche impossible." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const hasAccess = await hasAdminProspectsAccess();
  if (!hasAccess) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      practitionerId?: unknown;
      email?: unknown;
      confirmationEmail?: unknown;
    };

    const practitionerId = typeof body.practitionerId === "string" ? body.practitionerId.trim() : "";
    const email = normalizeEmail(body.email);
    const confirmationEmail = normalizeEmail(body.confirmationEmail);

    if (!practitionerId) {
      return NextResponse.json({ error: "Fiche manquante." }, { status: 400 });
    }

    if (!isValidEmail(email) || confirmationEmail !== email) {
      return NextResponse.json(
        { error: "Confirmation invalide. Ressaisissez exactement l’email à supprimer." },
        { status: 400 }
      );
    }

    const before = await deletePractitionerCascade(practitionerId);
    const deletedAt = new Date().toISOString();
    await suppressMarketingEmail({ email, practitioner: before.practitioner, deletedAt });

    const after = await loadPractitionerById(practitionerId);
    if (after) {
      return NextResponse.json({ error: "La suppression n’a pas pu être confirmée." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      deletedAt,
      before,
      after: {
        practitioner: null
      },
      exclusionEntry: buildExclusionEntry({
        practitioner: before.practitioner,
        email,
        deletedAt
      })
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Suppression impossible." },
      { status: 500 }
    );
  }
}
