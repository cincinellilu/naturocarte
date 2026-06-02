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
  return (
    <a
      {...props}
      onClick={(clickEvent) => {
        trackPractitionerStat(practitionerSlug, event);
        onClick?.(clickEvent);
      }}
    >
      {children}
    </a>
  );
}
