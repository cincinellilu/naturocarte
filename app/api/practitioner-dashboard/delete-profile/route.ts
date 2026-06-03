import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { recordProductEvent } from "@/lib/product-events-server";
import { getCurrentPractitionerSession } from "@/lib/practitioner-auth";
import { PRACTITIONER_STATUS_HIDDEN_CONTACTED } from "@/lib/practitioner-status";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type PractitionerAccountRow = {
  id: string;
  practitioner_id: string | null;
};

type PractitionerRow = {
  id: string;
  slug: string;
};

export async function POST(request: Request) {
  const session = await getCurrentPractitionerSession();
  if (!session) {
    return NextResponse.redirect(new URL("/praticiens?auth=required", request.url), {
      status: 303
    });
  }

  const formData = await request.formData();
  const rawConfirmation = formData.get("confirmation");
  const confirmation =
    typeof rawConfirmation === "string" ? rawConfirmation.trim().toUpperCase() : "";
  const redirectUrl = new URL("/praticiens/dashboard", request.url);

  if (confirmation !== "SUPPRIMER") {
    redirectUrl.searchParams.set("error", "delete_confirmation_required");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: account, error: accountError } = await supabase
    .from("practitioner_accounts")
    .select("id, practitioner_id")
    .eq("auth_user_id", session.userId)
    .maybeSingle<PractitionerAccountRow>();

  if (accountError || !account?.practitioner_id) {
    redirectUrl.searchParams.set("error", "missing_practitioner");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const { data: practitioner, error: practitionerError } = await supabase
    .from("practitioners")
    .select("id, slug")
    .eq("id", account.practitioner_id)
    .maybeSingle<PractitionerRow>();

  if (practitionerError || !practitioner) {
    redirectUrl.searchParams.set("error", "missing_practitioner");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const now = new Date().toISOString();
  const { error: profileUpdateError } = await supabase
    .from("practitioners")
    .update({
      status: PRACTITIONER_STATUS_HIDDEN_CONTACTED,
      updated_at: now
    })
    .eq("id", practitioner.id);

  if (profileUpdateError) {
    console.error("practitioner profile delete failed", profileUpdateError);
    redirectUrl.searchParams.set("error", "profile_delete_failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const { error: accountUpdateError } = await supabase
    .from("practitioner_accounts")
    .update({
      practitioner_id: null,
      updated_at: now
    })
    .eq("id", account.id);

  if (accountUpdateError) {
    console.error("practitioner profile detach failed", accountUpdateError);
    redirectUrl.searchParams.set("error", "account_update_failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  revalidatePath("/carte");
  revalidatePath("/annuaire-naturopathes");
  revalidatePath(`/naturopathe/${practitioner.slug}`);

  await recordProductEvent({
    eventName: "practitioner_profile_deleted",
    request,
    practitionerAccountId: account.id,
    practitionerId: practitioner.id,
    metadata: {
      delete_mode: "hidden_and_detached"
    }
  }).catch(() => {});

  redirectUrl.searchParams.set("saved", "profile_deleted");
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
