import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentPractitionerSession } from "@/lib/practitioner-auth";
import {
  PRACTITIONER_PLAN_PRESENCE,
  PRACTITIONER_PLAN_VISIBILITY
} from "@/lib/practitioner-plans";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const CONTACT_SLOTS = ["phone", "email", "booking_url"] as const;

function isContactSlot(value: string): value is (typeof CONTACT_SLOTS)[number] {
  return CONTACT_SLOTS.includes(value as (typeof CONTACT_SLOTS)[number]);
}

function normalizeNullable(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function POST(request: Request) {
  const session = await getCurrentPractitionerSession();
  if (!session) {
    return NextResponse.redirect(new URL("/praticiens?auth=required", request.url), {
      status: 303
    });
  }

  const formData = await request.formData();
  const contactSlot = normalizeNullable(formData.get("contact_slot")) ?? "phone";
  const phone = normalizeNullable(formData.get("phone"));
  const email = normalizeNullable(formData.get("email"));
  const bookingUrl = normalizeNullable(formData.get("booking_url"));
  const website = normalizeNullable(formData.get("website"));
  const description = normalizeNullable(formData.get("description"));
  const redirectUrl = new URL("/praticiens/dashboard", request.url);

  if (!isContactSlot(contactSlot)) {
    redirectUrl.searchParams.set("error", "invalid_contact_slot");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: account, error: accountError } = await supabase
    .from("practitioner_accounts")
    .select("id, practitioner_id, plan")
    .eq("auth_user_id", session.userId)
    .maybeSingle();

  if (accountError || !account?.practitioner_id) {
    redirectUrl.searchParams.set("error", "missing_practitioner");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const plan = account.plan === PRACTITIONER_PLAN_VISIBILITY
    ? PRACTITIONER_PLAN_VISIBILITY
    : PRACTITIONER_PLAN_PRESENCE;

  const updatePayload =
    plan === PRACTITIONER_PLAN_PRESENCE
      ? {
          phone: contactSlot === "phone" ? phone : null,
          email: contactSlot === "email" ? email : null,
          booking_url: contactSlot === "booking_url" ? bookingUrl : null
        }
      : {
          phone,
          email,
          booking_url: bookingUrl,
          website,
          description
        };

  const { data: practitioner, error: updateError } = await supabase
    .from("practitioners")
    .update(updatePayload)
    .eq("id", account.practitioner_id)
    .select("slug")
    .maybeSingle();

  if (updateError || !practitioner) {
    redirectUrl.searchParams.set("error", "save_failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  await supabase
    .from("practitioner_accounts")
    .update({ contact_slot: contactSlot, updated_at: new Date().toISOString() })
    .eq("id", account.id);

  revalidatePath(`/naturopathe/${practitioner.slug}`);
  redirectUrl.searchParams.set("saved", "profile");
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
