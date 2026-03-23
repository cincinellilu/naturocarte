"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  mobileLabel: string;
  icon: ReactNode;
  isActive: (pathname: string) => boolean;
};

const navigationItems: NavItem[] = [
  {
    href: "/carte",
    label: "Carte",
    mobileLabel: "Carte",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M3.75 6.75 9 4.5l6 2.25 5.25-2.25v12.75L15 19.5l-6-2.25-5.25 2.25V6.75Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M9 4.5v12.75M15 6.75V19.5" strokeLinecap="round" />
      </svg>
    ),
    isActive: (pathname) => pathname === "/" || pathname.startsWith("/carte")
  },
  {
    href: "/annuaire-naturopathes",
    label: "Annuaire",
    mobileLabel: "Annuaire",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M7.5 4.5h9A2.25 2.25 0 0 1 18.75 6.75v10.5A2.25 2.25 0 0 1 16.5 19.5h-9A2.25 2.25 0 0 1 5.25 17.25V6.75A2.25 2.25 0 0 1 7.5 4.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8.25 9h7.5M8.25 12h7.5M8.25 15h4.5" strokeLinecap="round" />
      </svg>
    ),
    isActive: (pathname) =>
      pathname.startsWith("/annuaire-naturopathes") ||
      pathname.startsWith("/naturopathe-paris") ||
      pathname.startsWith("/naturopathe/")
  },
  {
    href: "/praticiens",
    label: "Praticiens",
    mobileLabel: "Praticiens",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 18a7.5 7.5 0 0 1 15 0"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith("/praticiens")
  },
  {
    href: "/a-propos",
    label: "A propos",
    mobileLabel: "Infos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 10.5v4.5M12 7.5h.008" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    isActive: (pathname) => pathname.startsWith("/a-propos")
  }
];

function NavigationLink({
  item,
  pathname,
  mobile = false
}: {
  item: NavItem;
  pathname: string;
  mobile?: boolean;
}) {
  const isActive = item.isActive(pathname);

  return (
    <Link
      href={item.href}
      className={mobile ? "mobile-tabbar-link" : "site-nav-link"}
      aria-current={isActive ? "page" : undefined}
    >
      {mobile ? (
        <>
          <span className="mobile-tabbar-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{item.mobileLabel}</span>
        </>
      ) : (
        item.label
      )}
    </Link>
  );
}

export function SiteHeaderNav() {
  const pathname = usePathname();

  return (
    <div className="site-header-inner">
      <Link href="/carte" className="site-brand" aria-label="NaturoCarte, retour a la carte">
        <span className="site-brand-name">NaturoCarte</span>
      </Link>

      <nav className="site-nav" aria-label="Navigation principale">
        <ul className="site-nav-list">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <NavigationLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="mobile-tabbar" aria-label="Navigation mobile principale">
      <ul className="mobile-tabbar-list">
        {navigationItems.map((item) => (
          <li key={item.href}>
            <NavigationLink item={item} pathname={pathname} mobile />
          </li>
        ))}
      </ul>
    </nav>
  );
}
