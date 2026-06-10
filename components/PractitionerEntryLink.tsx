"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { rememberPractitionerEntrySource } from "@/lib/practitioner-entry-source";

type PractitionerEntryLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
    practitionerSlug: string;
    source: string;
  };

export default function PractitionerEntryLink({
  children,
  practitionerSlug,
  source,
  onClick,
  ...props
}: PractitionerEntryLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        rememberPractitionerEntrySource(practitionerSlug, source);
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
