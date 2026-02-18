import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const revalidate = 3600; // 1h, ajustable

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  let practitionerEntries: MetadataRoute.Sitemap = [];

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("practitioners")
      .select("slug, updated_at:created_at") // pas de updated_at => on prend created_at
      .eq("status", "published");

    practitionerEntries = (data ?? []).map((p) => ({
      url: `${siteUrl}/naturopathe/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.7
    }));
  } catch {
    practitionerEntries = [];
  }

  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/carte`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...practitionerEntries,
    { url: `${siteUrl}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${siteUrl}/mentions-legales`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2
    },
    {
      url: `${siteUrl}/confidentialite`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2
    }
  ];
}
