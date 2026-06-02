"use client";

import dynamic from "next/dynamic";

const CookieBannerNoSSR = dynamic(() => import("./CookieBanner").then((mod) => mod.default), {
  ssr: false
});

export default function CookieBannerMount() {
  return <CookieBannerNoSSR />;
}
