import { NextResponse } from "next/server";
import { ADMIN_PROSPECTS_COOKIE_NAME } from "@/lib/admin-prospects-auth";
import { getSiteUrl } from "@/lib/site";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/prospects", getSiteUrl()), {
    status: 303
  });
  response.cookies.delete(ADMIN_PROSPECTS_COOKIE_NAME);

  return response;
}
