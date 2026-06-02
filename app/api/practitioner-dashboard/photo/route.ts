import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentPractitionerSession } from "@/lib/practitioner-auth";
import { PRACTITIONER_PLAN_VISIBILITY } from "@/lib/practitioner-plans";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const PHOTO_BUCKET = "practitioner-photos";
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type PractitionerAccountRow = {
  id: string;
  practitioner_id: string | null;
  plan: string;
};

type PractitionerRow = {
  slug: string;
};

function getFileExtension(file: File): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  const session = await getCurrentPractitionerSession();
  if (!session) {
    return NextResponse.redirect(new URL("/praticiens?auth=required", request.url), {
      status: 303
    });
  }

  const redirectUrl = new URL("/praticiens/dashboard", request.url);
  const formData = await request.formData();
  const photo = formData.get("photo");

  if (!(photo instanceof File) || photo.size === 0) {
    redirectUrl.searchParams.set("error", "missing_photo");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (!ALLOWED_PHOTO_TYPES.has(photo.type) || photo.size > MAX_PHOTO_SIZE_BYTES) {
    redirectUrl.searchParams.set("error", "invalid_photo");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: account, error: accountError } = await supabase
    .from("practitioner_accounts")
    .select("id, practitioner_id, plan")
    .eq("auth_user_id", session.userId)
    .maybeSingle<PractitionerAccountRow>();

  if (accountError || !account?.practitioner_id) {
    redirectUrl.searchParams.set("error", "missing_practitioner");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  if (account.plan !== PRACTITIONER_PLAN_VISIBILITY) {
    redirectUrl.searchParams.set("error", "paid_required");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const fileExtension = getFileExtension(photo);
  const filePath = `${account.practitioner_id}/${Date.now()}.${fileExtension}`;
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(filePath, await photo.arrayBuffer(), {
      contentType: photo.type,
      upsert: false
    });

  if (uploadError) {
    console.error("practitioner photo upload failed", uploadError);
    redirectUrl.searchParams.set("error", "photo_upload_failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const { data: publicUrlData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(filePath);
  const photoUrl = publicUrlData.publicUrl;

  const { data: practitioner, error: updateError } = await supabase
    .from("practitioners")
    .update({ photo_url: photoUrl })
    .eq("id", account.practitioner_id)
    .select("slug")
    .maybeSingle<PractitionerRow>();

  if (updateError || !practitioner?.slug) {
    console.error("practitioner photo url update failed", updateError);
    redirectUrl.searchParams.set("error", "photo_save_failed");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  revalidatePath(`/naturopathe/${practitioner.slug}`);
  redirectUrl.searchParams.set("saved", "photo");
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
