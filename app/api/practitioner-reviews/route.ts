import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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
      email?: string;
      rating?: unknown;
      message?: string | null;
    };

    const practitionerSlug = body.practitionerSlug?.trim();
    const email = body.email?.trim();
    const rating = normalizeRating(body.rating);
    const message = body.message?.trim() || "";

    if (!practitionerSlug) {
      return NextResponse.json({ error: "missing_practitioner" }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    if (rating === null) {
      return NextResponse.json({ error: "invalid_rating" }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "message_too_long" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
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
        email,
        rating,
        message: message || null,
        status: "pending"
      })
      .select("id, status, created_at")
      .maybeSingle();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    revalidatePath(`/naturopathe/${practitionerSlug}`);

    return NextResponse.json({
      ok: true,
      review: review
    });
  } catch (error) {
    console.error("practitioner-reviews server error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
