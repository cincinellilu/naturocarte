import { NextResponse } from "next/server";

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
    const practitionerName = body.practitionerName?.trim();
    const email = body.email?.trim();
    const rating = normalizeRating(body.rating);
    const message = body.message?.trim() || "";

    if (!practitionerSlug || !practitionerName) {
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

    return NextResponse.json({
      ok: true,
      received: {
        practitionerSlug,
        practitionerName,
        email,
        rating,
        message: message || null
      }
    });
  } catch (error) {
    console.error("practitioner-reviews server error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
