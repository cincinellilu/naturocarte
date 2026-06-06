import { NextResponse } from "next/server";
import { createAppUrl } from "@/lib/app-url";
import { PRACTITIONER_SESSION_COOKIE_NAME } from "@/lib/practitioner-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(createAppUrl("/praticiens", request), {
    status: 303
  });

  response.cookies.delete(PRACTITIONER_SESSION_COOKIE_NAME);
  return response;
}
