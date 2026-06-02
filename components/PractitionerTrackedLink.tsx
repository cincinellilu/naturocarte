"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import {
  trackPractitionerStat,
  type PractitionerStatEvent
} from "@/components/PractitionerStatsTracker";

type PractitionerTrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  event: PractitionerStatEvent;
  practitionerSlug: string;
};

export default function PractitionerTrackedLink({
  children,
  event,
  practitionerSlug,
  onClick,
  ...props
}: PractitionerTrackedLinkProps) {
  const channel =
    event === "booking_click"
      ? "booking"
      : props.href?.startsWith("tel:")
        ? "phone"
        : props.href?.startsWith("mailto:")
          ? "email"
          : "website";

  return (
    <a
      {...props}
      onClick={(clickEvent) => {
        trackPractitionerStat(practitionerSlug, event, {
          source: "profile_page",
          channel
        });
        onClick?.(clickEvent);
      }}
    >
      {children}
    </a>
  );
}
