import { NextResponse } from "next/server";
import {
  recordProductEvent,
  type ProductEventMetadata
} from "@/lib/product-events-server";

function normalizeMetadata(value: unknown): ProductEventMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => {
      return (
        item === null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
      );
    })
    .map(([key, item]) => [key, item] as const);

  return Object.fromEntries(entries) as ProductEventMetadata;
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      eventName?: unknown;
      pagePath?: unknown;
      referrer?: unknown;
      deviceType?: unknown;
      source?: unknown;
      sessionId?: unknown;
      practitionerSlug?: unknown;
      metadata?: unknown;
    };

    const eventName = getString(body.eventName)?.trim();

    if (!eventName) {
      return NextResponse.json({ error: "missing_event_name" }, { status: 400 });
    }

    const metadata = normalizeMetadata(body.metadata);
    const practitionerSlug =
      getString(body.practitionerSlug) ?? getString(metadata.practitioner_slug);

    await recordProductEvent({
      eventName,
      request,
      pagePath: getString(body.pagePath),
      referrer: getString(body.referrer),
      deviceType: getString(body.deviceType),
      source: getString(body.source) ?? getString(metadata.source),
      sessionId: getString(body.sessionId),
      practitionerSlug,
      metadata
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("product event server error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
