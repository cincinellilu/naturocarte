"use client";

import dynamic from "next/dynamic";

const CookieSettingsButtonNoSSR = dynamic(() => import("./CookieSettingsButton").then((mod) => mod.default), {
  ssr: false
});

export default function CookieSettingsButtonMount() {
  return <CookieSettingsButtonNoSSR />;
}
