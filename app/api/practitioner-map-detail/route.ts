import { NextResponse } from "next/server";
import { getPartnerAccount, type PractitionerAccountPlanRow } from "@/lib/practitioner-partner";
import {
  getVisiblePublicContacts,
  type PractitionerPublicAccountInput
} from "@/lib/practitioner-public-contact";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();

  if (!slug) {
    return NextResponse.json({ detail: null }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("practitioners")
    .select("slug, phone, email, booking_url, photo_url, description, practitioner_accounts(id, plan, contact_slot, stripe_subscription_status)")
    .eq("slug", slug)
    .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
    .maybeSingle<{
      slug: string;
      phone: string | null;
      email: string | null;
      booking_url: string | null;
      photo_url: string | null;
      description: string | null;
      practitioner_accounts:
        | PractitionerPublicAccountInput[]
        | PractitionerPublicAccountInput
        | null;
    }>();

  if (error || !data) {
    return NextResponse.json({ detail: null }, { status: 404 });
  }

  const { practitioner_accounts: _accounts, ...detail } = data;
  const visibleContacts = getVisiblePublicContacts({
    practitioner: {
      phone: detail.phone,
      email: detail.email,
      booking_url: detail.booking_url
    },
    accounts: data.practitioner_accounts
  });
  const visiblePhone = visibleContacts.find((contact) => contact.type === "phone")?.value ?? null;
  const visibleEmail = visibleContacts.find((contact) => contact.type === "email")?.value ?? null;
  const visibleBookingUrl =
    visibleContacts.find((contact) => contact.type === "booking_url")?.value ?? null;

  return NextResponse.json({
    detail: {
      ...detail,
      phone: visiblePhone,
      email: visibleEmail,
      booking_url: visibleBookingUrl,
      is_partner: Boolean(getPartnerAccount(data.practitioner_accounts))
    }
  });
}
