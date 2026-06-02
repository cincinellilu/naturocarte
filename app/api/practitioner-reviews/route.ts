import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { recordProductEvent } from "@/lib/product-events-server";
import { getCurrentUserSession } from "@/lib/user-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function normalizeRating(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 5) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 5) {
      return parsed;
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      practitionerSlug?: string;
      practitionerName?: string;
      rating?: unknown;
      message?: string | null;
    };

    const session = await getCurrentUserSession();
    if (!session) {
      await recordProductEvent({
        eventName: "review_auth_required",
        request,
        practitionerSlug: body.practitionerSlug,
        metadata: { practitioner_slug: body.practitionerSlug ?? "" }
      }).catch(() => {});
      return NextResponse.json({ error: "auth_required" }, { status: 401 });
    }

    const practitionerSlug = body.practitionerSlug?.trim();
    const rating = normalizeRating(body.rating);
    const message = body.message?.trim() || "";

    if (!practitionerSlug) {
      return NextResponse.json({ error: "missing_practitioner" }, { status: 400 });
    }

    if (rating === null) {
      return NextResponse.json({ error: "invalid_rating" }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "message_too_long" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { data: account, error: accountError } = await supabase
      .from("user_accounts")
      .select("id, email")
      .eq("auth_user_id", session.userId)
      .maybeSingle<{ id: string; email: string }>();

    if (accountError || !account) {
      return NextResponse.json({ error: "missing_account" }, { status: 401 });
    }

    const { data: practitioner, error: practitionerError } = await supabase
      .from("practitioners")
      .select("id, slug, first_name, last_name")
      .eq("slug", practitionerSlug)
      .maybeSingle();

    if (practitionerError) {
      return NextResponse.json({ error: practitionerError.message }, { status: 500 });
    }

    if (!practitioner) {
      return NextResponse.json({ error: "missing_practitioner" }, { status: 404 });
    }

    const { data: review, error: insertError } = await supabase
      .from("practitioner_reviews")
      .insert({
        practitioner_id: practitioner.id,
        user_account_id: account.id,
        email: account.email,
        rating,
        message: message || null,
        status: "pending"
      })
      .select("id, status, created_at")
      .maybeSingle();

    if (insertError) {
      await recordProductEvent({
        eventName: "review_submit_failed",
        request,
        practitionerId: practitioner.id,
        metadata: {
          practitioner_slug: practitionerSlug,
          reason: "insert_error"
        }
      }).catch(() => {});
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    revalidatePath(`/naturopathe/${practitionerSlug}`);
    await recordProductEvent({
      eventName: "review_created_pending",
      request,
      practitionerId: practitioner.id,
      metadata: {
        practitioner_slug: practitionerSlug,
        rating,
        has_message: Boolean(message)
      }
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      review: review
    });
  } catch (error) {
    console.error("practitioner-reviews server error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
