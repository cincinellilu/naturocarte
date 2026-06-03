import { NextResponse } from "next/server";
import { PUBLIC_PRACTITIONER_STATUSES } from "@/lib/practitioner-status";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();

  if (!slug) {
    return NextResponse.json({ detail: null }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("practitioners")
    .select("slug, phone, email, booking_url, photo_url, description")
    .eq("slug", slug)
    .in("status", [...PUBLIC_PRACTITIONER_STATUSES])
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ detail: null }, { status: 404 });
  }

  return NextResponse.json({ detail: data });
}
