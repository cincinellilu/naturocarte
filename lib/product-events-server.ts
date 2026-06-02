import { getCurrentPractitionerSession } from "@/lib/practitioner-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { getCurrentUserSession } from "@/lib/user-auth";

type ProductEventMetadataValue = string | number | boolean | null;
export type ProductEventMetadata = Record<string, ProductEventMetadataValue>;

type RecordProductEventParams = {
  eventName: string;
  request?: Request;
  pagePath?: string | null;
  referrer?: string | null;
  deviceType?: string | null;
  source?: string | null;
  sessionId?: string | null;
  userAccountId?: string | null;
  practitionerAccountId?: string | null;
  practitionerSlug?: string | null;
  practitionerId?: string | null;
  metadata?: ProductEventMetadata;
};

function isEventName(value: string): boolean {
  return /^[a-z0-9][a-z0-9_:.:-]{1,79}$/.test(value);
}

function safeText(value: string | null | undefined, maxLength: number): string | null {
  const normalized = value?.trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
}

function normalizeDeviceType(value: string | null | undefined): string {
  if (value === "desktop" || value === "tablet" || value === "mobile") return value;
  return "unknown";
}

function normalizeMetadata(metadata: ProductEventMetadata = {}): ProductEventMetadata {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined)
      .slice(0, 30)
      .map(([key, value]) => [
        key.slice(0, 80),
        typeof value === "string" && value.length > 500 ? value.slice(0, 500) : value
      ])
  );
}

async function resolveSessionAccounts() {
  const supabase = getSupabaseAdminClient();
  const [userSession, practitionerSession] = await Promise.all([
    getCurrentUserSession().catch(() => null),
    getCurrentPractitionerSession().catch(() => null)
  ]);

  const [userAccountResult, practitionerAccountResult] = await Promise.all([
    userSession
      ? supabase
          .from("user_accounts")
          .select("id")
          .eq("auth_user_id", userSession.userId)
          .maybeSingle<{ id: string }>()
      : Promise.resolve({ data: null }),
    practitionerSession
      ? supabase
          .from("practitioner_accounts")
          .select("id")
          .eq("auth_user_id", practitionerSession.userId)
          .maybeSingle<{ id: string }>()
      : Promise.resolve({ data: null })
  ]);

  return {
    userAccountId: userAccountResult.data?.id ?? null,
    practitionerAccountId: practitionerAccountResult.data?.id ?? null
  };
}

async function resolvePractitionerId(params: {
  practitionerId?: string | null;
  practitionerSlug?: string | null;
}) {
  if (params.practitionerId) return params.practitionerId;

  const slug = safeText(params.practitionerSlug, 180);
  if (!slug) return null;

  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("practitioners")
    .select("id")
    .eq("slug", slug)
    .maybeSingle<{ id: string }>();

  return data?.id ?? null;
}

export async function recordProductEvent(params: RecordProductEventParams) {
  if (!isEventName(params.eventName)) return;

  const supabase = getSupabaseAdminClient();
  const [{ userAccountId, practitionerAccountId }, practitionerId] = await Promise.all([
    resolveSessionAccounts(),
    resolvePractitionerId({
      practitionerId: params.practitionerId,
      practitionerSlug: params.practitionerSlug
    })
  ]);

  const headers = params.request?.headers;

  const { error } = await supabase.from("product_events").insert({
    event_name: params.eventName,
    page_path: safeText(params.pagePath, 600),
    referrer: safeText(params.referrer ?? headers?.get("referer"), 600),
    device_type: normalizeDeviceType(params.deviceType),
    source: safeText(params.source, 80),
    session_id: safeText(params.sessionId, 120),
    user_account_id: params.userAccountId ?? userAccountId,
    practitioner_account_id: params.practitionerAccountId ?? practitionerAccountId,
    practitioner_id: practitionerId,
    user_agent: safeText(headers?.get("user-agent"), 600),
    metadata: normalizeMetadata(params.metadata)
  });

  if (error) {
    throw error;
  }
}
