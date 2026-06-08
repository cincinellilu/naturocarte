import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import {
  getDefaultPractitionerAccount,
  getPractitionerAccountById,
  listPractitionerAccountsForSession
} from "@/lib/practitioner-accounts";
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

function normalizeAccountId(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" ? value.trim() || null : null;
}

export async function POST(request: Request) {
  const session = await getCurrentPractitionerSession();
  if (!session) {
    return NextResponse.redirect(createAppUrl("/praticiens?auth=required", request), {
      status: 303
    });
  }

  const formData = await request.formData();
  const rawConfirmation = formData.get("confirmation");
  const requestedAccountId = normalizeAccountId(formData.get("account_id"));
  const confirmation =
    typeof rawConfirmation === "string" ? rawConfirmation.trim().toUpperCase() : "";
  const redirectUrl = createAppUrl("/praticiens/dashboard", request);

  if (requestedAccountId) {
    redirectUrl.searchParams.set("cabinet", requestedAccountId);
  }

  if (confirmation !== "SUPPRIMER") {
    redirectUrl.searchParams.set("error", "delete_confirmation_required");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const supabase = getSupabaseAdminClient();
  let accounts;

  try {
    accounts = await listPractitionerAccountsForSession(supabase, {
      authUserId: session.userId,
      email: session.email
    });
  } catch {
    redirectUrl.searchParams.set("error", "missing_practitioner");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const account = requestedAccountId
    ? getPractitionerAccountById(accounts, requestedAccountId)
    : getDefaultPractitionerAccount(accounts);

  if ((requestedAccountId && !account) || !account?.practitioner_id) {
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
      status: PRACTITIONER_STATUS_HIDDEN_CONTACTED
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

  const fallbackAccount = accounts.find(
    (item) => item.id !== account.id && item.practitioner_id
  );

  if (fallbackAccount?.id) {
    redirectUrl.searchParams.set("cabinet", fallbackAccount.id);
  } else {
    redirectUrl.searchParams.delete("cabinet");
  }

  redirectUrl.searchParams.set("saved", "profile_deleted");
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
