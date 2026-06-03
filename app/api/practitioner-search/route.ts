import { NextResponse } from "next/server";
import { getPartnerAccount, type PractitionerAccountPlanRow } from "@/lib/practitioner-partner";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 8;

type PractitionerSearchRow = {
  slug: string;
  first_name: string | null;
  last_name: string | null;
  practitioner_accounts: PractitionerAccountPlanRow[] | PractitionerAccountPlanRow | null;
};

function normalizeQuery(value: string | null): string {
  return (value ?? "")
    .trim()
    .replace(/[,%]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = normalizeQuery(searchParams.get("q"));

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ results: [] });
  }

  const supabase = getSupabaseServerClient();
  const pattern = `%${query}%`;

  const { data, error } = await supabase
    .from("practitioners")
    .select("slug, first_name, last_name, practitioner_accounts(plan, stripe_subscription_status)")
    .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
    .or(`first_name.ilike.${pattern},last_name.ilike.${pattern}`)
    .order("last_name", { ascending: true })
    .limit(MAX_RESULTS);

  if (error) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  return NextResponse.json({
    results: (data ?? []).map((practitioner) => ({
      label: `${practitioner.first_name ?? ""} ${practitioner.last_name ?? ""}`.trim(),
      href: `/naturopathe/${practitioner.slug}`,
      is_partner: Boolean(
        getPartnerAccount((practitioner as PractitionerSearchRow).practitioner_accounts)
      )
    }))
  });
}
