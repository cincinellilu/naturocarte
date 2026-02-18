import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  if (process.env.NODE_ENV === "production" && siteUrl.includes("localhost")) {
    // eslint-disable-next-line no-console
    console.warn(
      "NEXT_PUBLIC_SITE_URL semble incorrect en production (localhost détecté)."
    );
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/"
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
