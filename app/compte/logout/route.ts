import { NextResponse } from "next/server";
import { USER_SESSION_COOKIE_NAME } from "@/lib/user-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/compte", request.url), { status: 303 });
  response.cookies.delete(USER_SESSION_COOKIE_NAME);
  return response;
}
