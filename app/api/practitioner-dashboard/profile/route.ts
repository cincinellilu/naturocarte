import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAppUrl } from "@/lib/app-url";
import {
  getDefaultPractitionerAccount,
  getPractitionerAccountById,
  listPractitionerAccountsForSession
} from "@/lib/practitioner-accounts";
import { getEffectivePractitionerPlan } from "@/lib/practitioner-billing";
import { recordProductEvent } from "@/lib/product-events-server";
import { getCurrentPractitionerSession } from "@/lib/practitioner-auth";
import {
  PRACTITIONER_PLAN_PRESENCE,
  PRACTITIONER_PLAN_VISIBILITY
} from "@/lib/practitioner-plans";
import { buildPractitionerTariffsText } from "@/lib/practitioner-tariffs";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const CONTACT_SLOTS = ["phone", "email", "booking_url"] as const;

type PractitionerAddressRow = {
  slug: string;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
};

type GeocodedAddress = {
  lat: number;
  lng: number;
};

function isContactSlot(value: string): value is (typeof CONTACT_SLOTS)[number] {
  return CONTACT_SLOTS.includes(value as (typeof CONTACT_SLOTS)[number]);
}

function normalizeNullable(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

async function geocodePractitionerAddress(params: {
  addressLine: string;
  postalCode: string;
  city: string;
}): Promise<GeocodedAddress | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();
  if (!token) return null;

  const query = `${params.addressLine}, ${params.postalCode} ${params.city}, France`;
  const searchParams = new URLSearchParams({
    q: query,
    access_token: token,
    country: "fr",
    limit: "1",
    language: "fr",
    types: "address",
    proximity: "2.3522,48.8566"
  });

  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    features?: Array<{ geometry?: { coordinates?: [number, number] } }>;
  };
  const coordinates = payload.features?.[0]?.geometry?.coordinates;
  const lng = coordinates?.[0];
  const lat = coordinates?.[1];

  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

export async function POST(request: Request) {
  const session = await getCurrentPractitionerSession();
  if (!session) {
    return NextResponse.redirect(createAppUrl("/praticiens?auth=required", request), {
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
  const primaryTariff = normalizeNullable(formData.get("tariff_primary"));
  const additionalTariffs = normalizeNullable(formData.get("tariff_additional"));
  const adresse = normalizeNullable(formData.get("adresse"));
  const postalCode = normalizeNullable(formData.get("postal_code"));
  const city = normalizeNullable(formData.get("city"));
  const requestedAccountId = normalizeNullable(formData.get("account_id"));
  const redirectUrl = createAppUrl("/praticiens/dashboard", request);

  if (requestedAccountId) {
    redirectUrl.searchParams.set("cabinet", requestedAccountId);
  }

  if (!isContactSlot(contactSlot)) {
    redirectUrl.searchParams.set("error", "invalid_contact_slot");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (!adresse || !postalCode || !/^\d{5}$/.test(postalCode) || !city) {
    redirectUrl.searchParams.set("error", "invalid_address");
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

  const { data: currentPractitioner, error: practitionerLookupError } = await supabase
    .from("practitioners")
    .select("slug, adresse, postal_code, city, lat, lng")
    .eq("id", account.practitioner_id)
    .maybeSingle<PractitionerAddressRow>();

  if (practitionerLookupError || !currentPractitioner) {
    redirectUrl.searchParams.set("error", "missing_practitioner");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const addressChanged =
    adresse !== (currentPractitioner.adresse ?? "") ||
    postalCode !== (currentPractitioner.postal_code ?? "") ||
    city !== (currentPractitioner.city ?? "");
  const coordinatesMissing =
    typeof currentPractitioner.lat !== "number" ||
    !Number.isFinite(currentPractitioner.lat) ||
    typeof currentPractitioner.lng !== "number" ||
    !Number.isFinite(currentPractitioner.lng);

  let coordinates: GeocodedAddress | null = null;
  if (addressChanged || coordinatesMissing) {
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim()) {
      redirectUrl.searchParams.set("error", "missing_mapbox_token");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    coordinates = await geocodePractitionerAddress({
      addressLine: adresse,
      postalCode,
      city
    });

    if (!coordinates) {
      await recordProductEvent({
        eventName: "practitioner_profile_address_failed",
        request,
        practitionerAccountId: account.id,
        practitionerId: account.practitioner_id,
        metadata: { reason: "address_not_found", postal_code: postalCode, city }
      }).catch(() => {});
      redirectUrl.searchParams.set("error", "address_not_found");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }
  }

  const plan = getEffectivePractitionerPlan(accounts) === PRACTITIONER_PLAN_VISIBILITY
    ? PRACTITIONER_PLAN_VISIBILITY
    : PRACTITIONER_PLAN_PRESENCE;

  const addressPayload = {
    adresse,
    postal_code: postalCode,
    city,
    ...(coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : {})
  };
  const tarifs = buildPractitionerTariffsText({
    primaryTariff,
    additionalTariffs
  });

  const updatePayload =
    plan === PRACTITIONER_PLAN_PRESENCE
      ? {
          ...addressPayload,
          phone: contactSlot === "phone" ? phone : null,
          email: contactSlot === "email" ? email : null,
          booking_url: contactSlot === "booking_url" ? bookingUrl : null
        }
      : {
          ...addressPayload,
          phone,
          email,
          booking_url: bookingUrl,
          website,
          description,
          tarifs
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
  revalidatePath("/carte");
  await recordProductEvent({
    eventName: "practitioner_profile_updated",
    request,
    practitionerAccountId: account.id,
    practitionerId: account.practitioner_id,
    metadata: {
      plan,
      contact_slot: contactSlot,
      has_phone: Boolean(phone),
      has_email: Boolean(email),
      has_booking_url: Boolean(bookingUrl),
      has_website: Boolean(website),
      has_description: Boolean(description),
      has_tariffs: Boolean(tarifs),
      address_changed: addressChanged,
      coordinates_were_missing: coordinatesMissing,
      coordinates_updated: Boolean(coordinates)
    }
  }).catch(() => {});
  redirectUrl.searchParams.set("saved", "profile");
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
