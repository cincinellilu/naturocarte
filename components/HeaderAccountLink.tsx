"use client";

import Link from "next/link";
import { useSessionSummary } from "@/components/SessionSummaryProvider";

export default function HeaderAccountLink() {
  const summary = useSessionSummary();

  return (
    <Link href={summary.href} className="site-account-link" aria-label="Mon compte" prefetch={false}>
      {summary.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="site-account-avatar-image" src={summary.photoUrl} alt="" />
      ) : summary.initials ? (
        <span className="site-account-avatar-initials" aria-hidden="true">
          {summary.initials}
        </span>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
          <path
            d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M4.5 20.25a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
        </svg>
      )}
    </Link>
  );
}
