import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import { ADMIN_PROSPECTS_COOKIE_NAME } from "@/lib/admin-prospects-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(createAppUrl("/admin/prospects", request), {
    status: 303
  });
  response.cookies.delete(ADMIN_PROSPECTS_COOKIE_NAME);

  return response;
}
