import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import { ensureUserAccount } from "@/lib/auth-account-routing";
import {
  getCurrentPractitionerSession,
  PRACTITIONER_SESSION_COOKIE_NAME
} from "@/lib/practitioner-auth";
import {
  createUserSessionCookieValue,
  getUserSessionCookieOptions,
  USER_SESSION_COOKIE_NAME
} from "@/lib/user-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const session = await getCurrentPractitionerSession();
  if (!session) {
    return NextResponse.redirect(createAppUrl("/praticiens?auth=required", request), {
      status: 303
    });
  }

  const supabase = getSupabaseAdminClient();
  const userAccount = await ensureUserAccount(supabase, {
    authUserId: session.userId,
    email: session.email
  });

  if (!userAccount.ok) {
    console.error("user account creation after practitioner delete failed", userAccount.error);
    return NextResponse.redirect(
      createAppUrl("/praticiens/dashboard?error=account_update_failed", request),
      { status: 303 }
    );
  }

  const { error } = await supabase
    .from("practitioner_accounts")
    .delete()
    .eq("auth_user_id", session.userId);

  if (error) {
    console.error("practitioner space delete failed", error);
    return NextResponse.redirect(
      createAppUrl("/praticiens/dashboard?error=account_update_failed", request),
      { status: 303 }
    );
  }

  const response = NextResponse.redirect(createAppUrl("/compte", request), { status: 303 });
  response.cookies.set({
    name: USER_SESSION_COOKIE_NAME,
    value: createUserSessionCookieValue({ userId: session.userId, email: session.email }),
    ...getUserSessionCookieOptions()
  });
  response.cookies.delete(PRACTITIONER_SESSION_COOKIE_NAME);

  return response;
}
