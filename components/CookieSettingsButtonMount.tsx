"use client";

import dynamic from "next/dynamic";

const CookieSettingsButtonNoSSR = dynamic(() => import("./CookieSettingsButton"), {
  ssr: false
});

export default function CookieSettingsButtonMount() {
  return <CookieSettingsButtonNoSSR />;
}
