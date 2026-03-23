import { NextResponse } from "next/server";
import { hasAdminProspectsAccess } from "@/lib/admin-prospects-auth";
import {
  isManagedProspectStatus,
  MANAGED_PROSPECT_STATUSES
} from "@/lib/practitioner-status";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const hasAccess = await hasAdminProspectsAccess();

  if (!hasAccess) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      slug?: unknown;
      status?: unknown;
    };
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim() : "";

    if (!slug) {
      return NextResponse.json({ error: "Slug manquant." }, { status: 400 });
    }

    if (!isManagedProspectStatus(status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("practitioners")
      .update({ status })
      .eq("slug", slug)
      .in("status", [...MANAGED_PROSPECT_STATUSES])
      .select("slug, status")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Praticien introuvable dans le workflow admin." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      slug: data.slug,
      status: data.status
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
