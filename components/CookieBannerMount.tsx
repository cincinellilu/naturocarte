"use client";

import dynamic from "next/dynamic";

const CookieBannerNoSSR = dynamic(() => import("./CookieBanner"), {
  ssr: false
});

export default function CookieBannerMount() {
  return <CookieBannerNoSSR />;
}
