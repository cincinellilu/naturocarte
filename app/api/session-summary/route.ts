import { NextResponse } from "next/server";
import { getCurrentPractitionerSession } from "@/lib/practitioner-auth";
import { getCurrentUserSession } from "@/lib/user-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

type PractitionerAccountSummary = {
  practitioner_id: string | null;
};

type PractitionerSummary = {
  first_name: string;
  last_name: string;
  photo_url: string | null;
};

type UserAccountSummary = {
  first_name: string | null;
  last_name: string | null;
  email: string;
};

function getInitials(params: { firstName?: string | null; lastName?: string | null; email: string }): string {
  const first = params.firstName?.trim().charAt(0) ?? "";
  const last = params.lastName?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.trim();
  return initials ? initials.toUpperCase() : params.email.charAt(0).toUpperCase();
}

export async function GET() {
  const practitionerSession = await getCurrentPractitionerSession();
  const userSession = await getCurrentUserSession();
  const supabase = getSupabaseAdminClient();

  if (practitionerSession) {
    const { data: account } = await supabase
      .from("practitioner_accounts")
      .select("practitioner_id")
      .eq("auth_user_id", practitionerSession.userId)
      .maybeSingle<PractitionerAccountSummary>();

    if (account?.practitioner_id) {
      const { data: practitioner } = await supabase
        .from("practitioners")
        .select("first_name, last_name, photo_url")
        .eq("id", account.practitioner_id)
        .maybeSingle<PractitionerSummary>();

      return NextResponse.json({
        type: "practitioner",
        href: "/praticiens/dashboard",
        initials: getInitials({
          firstName: practitioner?.first_name,
          lastName: practitioner?.last_name,
          email: practitionerSession.email
        }),
        photoUrl: practitioner?.photo_url?.trim() || null
      });
    }

    return NextResponse.json({
      type: "practitioner",
      href: "/praticiens/dashboard",
      initials: getInitials({ email: practitionerSession.email }),
      photoUrl: null
    });
  }

  if (userSession) {
    const { data: account } = await supabase
      .from("user_accounts")
      .select("first_name, last_name, email")
      .eq("auth_user_id", userSession.userId)
      .maybeSingle<UserAccountSummary>();

    return NextResponse.json({
      type: "user",
      href: "/compte",
      initials: getInitials({
        firstName: account?.first_name,
        lastName: account?.last_name,
        email: account?.email ?? userSession.email
      }),
      photoUrl: null
    });
  }

  return NextResponse.json({
    type: "anonymous",
    href: "/compte",
    initials: null,
    photoUrl: null
  });
}
