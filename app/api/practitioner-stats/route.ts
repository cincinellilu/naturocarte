import { NextResponse } from "next/server";
import { recordProductEvent, type ProductEventMetadata } from "@/lib/product-events-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const STAT_EVENTS = ["profile_view", "contact_click", "booking_click"] as const;

type StatEvent = (typeof STAT_EVENTS)[number];

type StatsRow = {
  id: string;
  profile_views: number | null;
  contact_clicks: number | null;
  booking_clicks: number | null;
};

function normalizeMetadata(value: unknown): ProductEventMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, item]) => {
      return (
        item === null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
      );
    })
  ) as ProductEventMetadata;
}

function isStatEvent(value: unknown): value is StatEvent {
  return typeof value === "string" && STAT_EVENTS.includes(value as StatEvent);
}

function getColumnForEvent(event: StatEvent): keyof Omit<StatsRow, "id"> {
  if (event === "profile_view") return "profile_views";
  if (event === "booking_click") return "booking_clicks";
  return "contact_clicks";
}

async function incrementStat(practitionerId: string, event: StatEvent) {
  const supabase = getSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const column = getColumnForEvent(event);

  const { data: existing, error: existingError } = await supabase
    .from("practitioner_profile_stats")
    .select("id, profile_views, contact_clicks, booking_clicks")
    .eq("practitioner_id", practitionerId)
    .eq("date", today)
    .maybeSingle<StatsRow>();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("practitioner_profile_stats")
      .update({
        [column]: (existing[column] ?? 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id);

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const { error: insertError } = await supabase
    .from("practitioner_profile_stats")
    .insert({
      practitioner_id: practitionerId,
      date: today,
      [column]: 1
    });

  if (!insertError) {
    return;
  }

  // If two events create the same daily row at the same time, retry as update.
  const { data: retryRow, error: retryReadError } = await supabase
    .from("practitioner_profile_stats")
    .select("id, profile_views, contact_clicks, booking_clicks")
    .eq("practitioner_id", practitionerId)
    .eq("date", today)
    .maybeSingle<StatsRow>();

  if (retryReadError || !retryRow?.id) {
    throw insertError;
  }

  const { error: retryUpdateError } = await supabase
    .from("practitioner_profile_stats")
    .update({
      [column]: (retryRow[column] ?? 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq("id", retryRow.id);

  if (retryUpdateError) {
    throw retryUpdateError;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      practitionerSlug?: unknown;
      event?: unknown;
      metadata?: unknown;
    };

    const practitionerSlug = typeof body.practitionerSlug === "string" ? body.practitionerSlug.trim() : "";
    const event = body.event;
    const metadata = normalizeMetadata(body.metadata);

    if (!practitionerSlug || !isStatEvent(event)) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: practitioner, error: practitionerError } = await supabase
      .from("practitioners")
      .select("id")
      .eq("slug", practitionerSlug)
      .maybeSingle<{ id: string }>();

    if (practitionerError) {
      return NextResponse.json({ error: practitionerError.message }, { status: 500 });
    }

    if (!practitioner?.id) {
      return NextResponse.json({ error: "missing_practitioner" }, { status: 404 });
    }

    await incrementStat(practitioner.id, event);

    const source =
      typeof metadata.source === "string" ? metadata.source : "unknown";
    const eventName =
      event === "profile_view"
        ? "practitioner_profile_view"
        : event === "booking_click"
          ? "booking_click"
          : metadata.channel === "phone"
            ? "phone_click"
            : metadata.channel === "email"
              ? "email_click"
              : "website_click";

    await recordProductEvent({
      eventName,
      request,
      practitionerId: practitioner.id,
      practitionerSlug,
      source,
      metadata: {
        ...metadata,
        practitioner_slug: practitionerSlug
      }
    }).catch((error) => {
      console.error("product event from practitioner stats failed", error);
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("practitioner stats server error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
