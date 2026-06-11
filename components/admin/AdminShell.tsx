"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type AdminSectionKey =
  | "overview"
  | "clients"
  | "practitioners"
  | "campaigns"
  | "emailing"
  | "prospects"
  | "compliance";

type AdminShellProps = {
  section: AdminSectionKey;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  headerMeta?: string[];
};

const ADMIN_NAV_ITEMS: Array<{
  key: AdminSectionKey;
  href: string;
  label: string;
  detail: string;
}> = [
  {
    key: "overview",
    href: "/admin",
    label: "Tableau de bord",
    detail: "Indicateurs globaux"
  },
  {
    key: "clients",
    href: "/admin/clients",
    label: "Clients",
    detail: "Facturation et forfaits"
  },
  {
    key: "practitioners",
    href: "/admin/praticiens-actifs",
    label: "Praticiens",
    detail: "Comptes et fiches"
  },
  {
    key: "emailing",
    href: "/admin/emailing",
    label: "Emailing",
    detail: "Envois et audiences"
  },
  {
    key: "campaigns",
    href: "/admin/campagnes",
    label: "Revendications",
    detail: "Campagnes"
  },
  {
    key: "prospects",
    href: "/admin/prospects",
    label: "Prospects",
    detail: "Contact et visibilité"
  },
  {
    key: "compliance",
    href: "/admin/suppressions",
    label: "Suppressions",
    detail: "Retraits RGPD"
  }
];

export default function AdminShell({
  section,
  eyebrow,
  title,
  description,
  children,
  headerMeta = []
}: AdminShellProps) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isNavOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNavOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNavOpen]);

  return (
    <article className="article-shell admin-workspace">
      <button
        type="button"
        className={`admin-mobile-toggle${isNavOpen ? " is-open" : ""}`}
        aria-expanded={isNavOpen}
        aria-controls="admin-sidebar"
        hidden={isNavOpen}
        onClick={() => setIsNavOpen((current) => !current)}
      >
        <span className="admin-mobile-toggle-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>Admin</span>
      </button>

      <div
        className={`admin-mobile-backdrop${isNavOpen ? " is-open" : ""}`}
        aria-hidden={isNavOpen ? "false" : "true"}
        onClick={() => setIsNavOpen(false)}
      />

      <div className="admin-workspace-grid">
        <aside
          id="admin-sidebar"
          className={`admin-sidebar${isNavOpen ? " is-open" : ""}`}
          aria-label="Navigation admin"
        >
          <div className="admin-sidebar-brand">
            <div className="admin-sidebar-brand-mark" aria-hidden="true">
              N
            </div>
            <div>
              <p>NaturoCarte</p>
              <strong>Admin</strong>
            </div>
            <button
              type="button"
              className="admin-sidebar-close"
              aria-label="Fermer le menu admin"
              onClick={() => setIsNavOpen(false)}
            >
              <span />
              <span />
            </button>
          </div>

          <nav className="admin-sidebar-nav">
            {ADMIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`admin-sidebar-link${item.key === section ? " is-active" : ""}`}
                onClick={() => setIsNavOpen(false)}
              >
                <span className="admin-sidebar-link-label">{item.label}</span>
                <span className="admin-sidebar-link-detail">{item.detail}</span>
              </Link>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <Link className="btn btn-secondary" href="/">
              Voir le site
            </Link>
            <form action="/admin/prospects/logout" method="post">
              <button className="btn" type="submit">
                Déconnexion
              </button>
            </form>
          </div>
        </aside>

        <div className="admin-main">
          <section className="admin-hero">
            <div className="admin-hero-copy">
              <p className="page-eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p className="page-lead">{description}</p>
            </div>

            {headerMeta.length > 0 ? (
              <div className="admin-hero-meta" aria-label="Contexte de la page">
                {headerMeta.map((item) => (
                  <span className="admin-hero-chip" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </section>

          <div className="admin-main-content">{children}</div>
        </div>
      </div>
    </article>
  );
}
