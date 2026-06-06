import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import { USER_SESSION_COOKIE_NAME } from "@/lib/user-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(createAppUrl("/compte", request), { status: 303 });
  response.cookies.delete(USER_SESSION_COOKIE_NAME);
  return response;
}
