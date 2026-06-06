import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import {
  createUserSessionCookieValue,
  getCurrentUserSession,
  getUserSessionCookieOptions,
  USER_SESSION_COOKIE_NAME
} from "@/lib/user-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const session = await getCurrentUserSession();
  if (!session) {
    return NextResponse.redirect(createAppUrl("/compte?auth=required", request), {
      status: 303
    });
  }

  const formData = await request.formData();
  const firstName = normalizeText(formData.get("first_name"));
  const lastName = normalizeText(formData.get("last_name"));
  const email = normalizeText(formData.get("email")).toLowerCase();
  const redirectUrl = createAppUrl("/compte", request);

  if (!firstName || !lastName || !email || !isValidEmail(email)) {
    redirectUrl.searchParams.set("error", "invalid_profile");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const supabase = getSupabaseAdminClient();

  if (email !== session.email.toLowerCase()) {
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(session.userId, {
      email,
      email_confirm: true
    });

    if (authUpdateError) {
      console.error("user email auth update failed", authUpdateError);
      redirectUrl.searchParams.set("error", "email_update_failed");
      return NextResponse.redirect(redirectUrl, { status: 303 });
    }
  }

  const { error } = await supabase
    .from("user_accounts")
    .update({
      email,
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date().toISOString()
    })
    .eq("auth_user_id", session.userId);

  if (error) {
    console.error("user profile update failed", error);
    redirectUrl.searchParams.set("error", "save_failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  redirectUrl.searchParams.set("saved", "profile");
  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  response.cookies.set({
    name: USER_SESSION_COOKIE_NAME,
    value: createUserSessionCookieValue({ userId: session.userId, email }),
    ...getUserSessionCookieOptions()
  });

  return response;
}
