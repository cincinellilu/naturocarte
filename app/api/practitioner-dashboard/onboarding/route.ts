import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import { recordProductEvent } from "@/lib/product-events-server";
import { getCurrentPractitionerSession } from "@/lib/practitioner-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type PractitionerAccountRow = {
  id: string;
  practitioner_id: string | null;
  email: string;
};

type ExistingPractitionerRow = {
  id: string;
  siret: string | null;
  email: string | null;
};

type GeocodedAddress = {
  lat: number;
  lng: number;
};

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSiret(value: string): string {
  return value.replace(/\D/g, "");
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

async function createUniquePractitionerSlug(params: {
  firstName: string;
  lastName: string;
  supabase: ReturnType<typeof getSupabaseAdminClient>;
}): Promise<string> {
  const baseSlug = slugify(`${params.firstName} ${params.lastName}`) || "praticien";
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data } = await params.supabase
      .from("practitioners")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
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
  const firstName = normalizeText(formData.get("first_name"));
  const lastName = normalizeText(formData.get("last_name"));
  const siret = normalizeSiret(normalizeText(formData.get("siret")));
  const addressLine = normalizeText(formData.get("address_line"));
  const postalCode = normalizeText(formData.get("postal_code"));
  const city = normalizeText(formData.get("city"));
  const redirectUrl = createAppUrl("/praticiens/dashboard", request);

  if (!firstName || !lastName || siret.length !== 14 || !addressLine || !/^\d{5}$/.test(postalCode) || !city) {
    redirectUrl.searchParams.set("error", "invalid_profile");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim()) {
    redirectUrl.searchParams.set("error", "missing_mapbox_token");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const coordinates = await geocodePractitionerAddress({ addressLine, postalCode, city });
  if (!coordinates) {
    await recordProductEvent({
      eventName: "practitioner_onboarding_failed",
      request,
      metadata: { reason: "address_not_found" }
    }).catch(() => {});
    redirectUrl.searchParams.set("error", "address_not_found");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: account, error: accountError } = await supabase
    .from("practitioner_accounts")
    .select("id, practitioner_id, email")
    .eq("auth_user_id", session.userId)
    .maybeSingle<PractitionerAccountRow>();

  if (accountError || !account) {
    redirectUrl.searchParams.set("error", "missing_account");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (account.practitioner_id) {
    redirectUrl.searchParams.set("saved", "profile_ready");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const { data: existingBySiret, error: existingSiretError } = await supabase
    .from("practitioners")
    .select("id, siret, email")
    .eq("siret", siret)
    .maybeSingle<ExistingPractitionerRow>();

  if (existingSiretError) {
    redirectUrl.searchParams.set(
      "error",
      existingSiretError.code === "42703" ? "missing_siret_column" : "lookup_failed"
    );
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const { data: existingByEmail, error: existingEmailError } = await supabase
    .from("practitioners")
    .select("id, siret, email")
    .ilike("email", account.email)
    .maybeSingle<ExistingPractitionerRow>();

  if (existingEmailError) {
    redirectUrl.searchParams.set("error", "lookup_failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (existingBySiret && existingByEmail && existingBySiret.id !== existingByEmail.id) {
    redirectUrl.searchParams.set("error", "conflicting_existing_profile");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (existingByEmail?.siret && existingByEmail.siret !== siret) {
    redirectUrl.searchParams.set("error", "email_already_used");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  let practitionerId = existingBySiret?.id ?? existingByEmail?.id ?? null;

  if (!practitionerId) {
    const slug = await createUniquePractitionerSlug({ firstName, lastName, supabase });
    const { data: practitioner, error: createError } = await supabase
      .from("practitioners")
      .insert({
        first_name: firstName,
        last_name: lastName.toUpperCase(),
        slug,
        siret,
        adresse: addressLine,
        postal_code: postalCode,
        city,
        lat: coordinates.lat,
        lng: coordinates.lng,
        email: account.email,
        status: "published"
      })
      .select("id")
      .maybeSingle<{ id: string }>();

    if (createError || !practitioner?.id) {
      console.error("dashboard practitioner onboarding creation failed", createError);
      await recordProductEvent({
        eventName: "practitioner_onboarding_failed",
        request,
        metadata: {
          reason: createError?.code === "23505" ? "duplicate_siret" : "profile_creation_failed"
        }
      }).catch(() => {});
      redirectUrl.searchParams.set(
        "error",
        createError?.code === "23505" ? "duplicate_siret" : "profile_creation_failed"
      );
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }

    practitionerId = practitioner.id;
  } else {
    const { error: publishError } = await supabase
      .from("practitioners")
      .update({
        email: account.email,
        status: "published",
        updated_at: new Date().toISOString()
      })
      .eq("id", practitionerId);

    if (publishError) {
      console.error("dashboard practitioner onboarding publish failed", publishError);
      redirectUrl.searchParams.set("error", "profile_publish_failed");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }
  }

  const { error: updateError } = await supabase
    .from("practitioner_accounts")
    .update({
      practitioner_id: practitionerId,
      contact_slot: "email",
      updated_at: new Date().toISOString()
    })
    .eq("id", account.id);

  if (updateError) {
    redirectUrl.searchParams.set("error", "account_update_failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  await supabase.auth.admin.updateUserById(session.userId, {
    user_metadata: {
      practitioner_first_name: firstName,
      practitioner_last_name: lastName,
      practitioner_siret: siret
    }
  });

  const { data: existingUserAccount, error: userAccountLookupError } = await supabase
    .from("user_accounts")
    .select("id")
    .eq("auth_user_id", session.userId)
    .maybeSingle<{ id: string }>();

  if (userAccountLookupError) {
    console.error("dashboard user account lookup failed", userAccountLookupError);
  } else if (existingUserAccount?.id) {
    await supabase
      .from("user_accounts")
      .update({
        email: account.email,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      })
      .eq("id", existingUserAccount.id);
  } else {
    const { data: existingUserByEmail } = await supabase
      .from("user_accounts")
      .select("id")
      .ilike("email", account.email)
      .maybeSingle<{ id: string }>();

    if (existingUserByEmail?.id) {
      await supabase
        .from("user_accounts")
        .update({
          auth_user_id: session.userId,
          email: account.email,
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingUserByEmail.id);
    } else {
      await supabase.from("user_accounts").insert({
        auth_user_id: session.userId,
        email: account.email,
        first_name: firstName,
        last_name: lastName
      });
    }
  }

  redirectUrl.searchParams.set("saved", "profile_created");
  await recordProductEvent({
    eventName: "practitioner_onboarding_completed",
    request,
    practitionerAccountId: account.id,
    practitionerId,
    metadata: {
      city,
      postal_code: postalCode
    }
  }).catch(() => {});
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
