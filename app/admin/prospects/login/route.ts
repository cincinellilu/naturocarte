import { NextResponse } from "next/server";
import {
  ADMIN_PROSPECTS_COOKIE_NAME,
  getAdminProspectsSessionValue,
  isAdminProspectsConfigured,
  verifyAdminProspectsPassword
} from "@/lib/admin-prospects-auth";

export async function POST(request: Request) {
  const redirectUrl = new URL("/admin/prospects", request.url);

  if (!isAdminProspectsConfigured()) {
    redirectUrl.searchParams.set("error", "missing_config");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const formData = await request.formData();
  const rawPassword = formData.get("password");
  const password = typeof rawPassword === "string" ? rawPassword.trim() : "";

  if (!verifyAdminProspectsPassword(password)) {
    redirectUrl.searchParams.set("error", "invalid_password");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const cookieValue = getAdminProspectsSessionValue();
  if (!cookieValue) {
    redirectUrl.searchParams.set("error", "missing_config");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  response.cookies.set({
    name: ADMIN_PROSPECTS_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}
