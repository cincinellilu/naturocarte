import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAppUrl, getSafeAppUrl } from "@/lib/app-url";
import { recordProductEvent } from "@/lib/product-events-server";
import { getCurrentUserSession } from "@/lib/user-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type UserAccountRow = {
  id: string;
};

type PractitionerRow = {
  id: string;
  slug: string;
};

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function getSafeRedirect(request: Request, value: string): URL {
  const fallback = request.headers.get("referer") || "/compte";
  const target = value || fallback;
  return getSafeAppUrl(request, target, "/compte");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const practitionerSlug = normalizeText(formData.get("practitioner_slug"));
  const intent = normalizeText(formData.get("intent")) || "add";
  const redirectTarget = normalizeText(formData.get("redirect"));
  const redirectUrl = getSafeRedirect(request, redirectTarget);

  if (!practitionerSlug) {
    redirectUrl.searchParams.set("favorite", "missing_practitioner");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const session = await getCurrentUserSession();
  if (!session) {
    await recordProductEvent({
      eventName: "favorite_auth_required",
      request,
      practitionerSlug,
      metadata: { practitioner_slug: practitionerSlug }
    }).catch(() => {});
    const loginUrl = createAppUrl("/compte", request);
    loginUrl.searchParams.set("next", redirectUrl.pathname + redirectUrl.search + redirectUrl.hash);
    loginUrl.searchParams.set("auth", "required");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: account, error: accountError } = await supabase
    .from("user_accounts")
    .select("id")
    .eq("auth_user_id", session.userId)
    .maybeSingle<UserAccountRow>();

  if (accountError || !account) {
    redirectUrl.searchParams.set("favorite", "missing_account");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const { data: practitioner, error: practitionerError } = await supabase
    .from("practitioners")
    .select("id, slug")
    .eq("slug", practitionerSlug)
    .maybeSingle<PractitionerRow>();

  if (practitionerError || !practitioner) {
    redirectUrl.searchParams.set("favorite", "missing_practitioner");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (intent === "remove") {
    await supabase
      .from("user_favorite_practitioners")
      .delete()
      .eq("user_account_id", account.id)
      .eq("practitioner_id", practitioner.id);
    redirectUrl.searchParams.set("favorite", "removed");
    await recordProductEvent({
      eventName: "favorite_removed",
      request,
      practitionerId: practitioner.id,
      metadata: { practitioner_slug: practitioner.slug }
    }).catch(() => {});
  } else {
    await supabase.from("user_favorite_practitioners").upsert(
      {
        user_account_id: account.id,
        practitioner_id: practitioner.id
      },
      { onConflict: "user_account_id,practitioner_id" }
    );
    redirectUrl.searchParams.set("favorite", "added");
    await recordProductEvent({
      eventName: "favorite_added",
      request,
      practitionerId: practitioner.id,
      metadata: { practitioner_slug: practitioner.slug }
    }).catch(() => {});
  }

  revalidatePath("/compte");
  revalidatePath(`/naturopathe/${practitioner.slug}`);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
