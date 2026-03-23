"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useState } from "react";
import {
  getManagedProspectStatus,
  getProspectStateFromStatus
} from "@/lib/practitioner-status";

export type AdminProspect = {
  slug: string;
  first_name: string;
  last_name: string;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: string;
};

type FilterKey = "all" | "to_contact" | "contacted" | "visible" | "hidden";

const FILTER_LABELS: Record<FilterKey, string> = {
  all: "Tous",
  to_contact: "À contacter",
  contacted: "Contactés",
  visible: "Visibles",
  hidden: "Masqués"
};

function normalizeUrl(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

function buildAddressLine(practitioner: AdminProspect): string {
  const parts = [practitioner.adresse, practitioner.postal_code, practitioner.city]
    .map((value) => value?.trim())
    .filter(Boolean);

  return parts.join(", ");
}

function buildSearchBlob(practitioner: AdminProspect): string {
  return [
    practitioner.first_name,
    practitioner.last_name,
    practitioner.slug,
    practitioner.city,
    practitioner.postal_code,
    practitioner.adresse,
    practitioner.phone,
    practitioner.email
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("fr");
}

export default function AdminProspectsDashboard({
  practitioners
}: {
  practitioners: AdminProspect[];
}) {
  const [items, setItems] = useState(practitioners);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [savingSlugs, setSavingSlugs] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("fr"));

  const counts = items.reduce(
    (accumulator, practitioner) => {
      const state = getProspectStateFromStatus(practitioner.status);

      accumulator.all += 1;
      if (state.isVisible) accumulator.visible += 1;
      if (!state.isVisible) accumulator.hidden += 1;
      if (state.isContacted) accumulator.contacted += 1;
      if (!state.isContacted) accumulator.to_contact += 1;

      return accumulator;
    },
    { all: 0, to_contact: 0, contacted: 0, visible: 0, hidden: 0 }
  );

  const visibleItems = items.filter((practitioner) => {
    const state = getProspectStateFromStatus(practitioner.status);

    if (filter === "to_contact" && state.isContacted) return false;
    if (filter === "contacted" && !state.isContacted) return false;
    if (filter === "visible" && !state.isVisible) return false;
    if (filter === "hidden" && state.isVisible) return false;

    if (!deferredQuery) return true;

    return buildSearchBlob(practitioner).includes(deferredQuery);
  });

  async function updatePractitioner(
    practitioner: AdminProspect,
    patch: Partial<{ isVisible: boolean; isContacted: boolean }>
  ) {
    const currentState = getProspectStateFromStatus(practitioner.status);
    const nextStatus = getManagedProspectStatus({
      isVisible: patch.isVisible ?? currentState.isVisible,
      isContacted: patch.isContacted ?? currentState.isContacted
    });

    setErrorMessage(null);
    startTransition(() => {
      setSavingSlugs((current) => ({ ...current, [practitioner.slug]: true }));
    });

    try {
      const response = await fetch("/api/admin/prospects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slug: practitioner.slug,
          status: nextStatus
        })
      });

      const result = (await response.json()) as
        | { status?: string; error?: string }
        | undefined;

      if (!response.ok || !result?.status) {
        throw new Error(result?.error || "La mise à jour a échoué.");
      }

      setItems((current) =>
        current.map((item) =>
          item.slug === practitioner.slug ? { ...item, status: result.status as string } : item
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "La mise à jour a échoué."
      );
    } finally {
      startTransition(() => {
        setSavingSlugs((current) => {
          const next = { ...current };
          delete next[practitioner.slug];
          return next;
        });
      });
    }
  }

  return (
    <div className="admin-prospects-shell">
      <div className="admin-prospects-toolbar">
        <div className="admin-prospects-search">
          <label className="admin-prospects-label" htmlFor="admin-prospects-search">
            Rechercher un naturopathe
          </label>
          <input
            id="admin-prospects-search"
            className="admin-prospects-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, ville, code postal, email..."
          />
        </div>

        <div className="admin-prospects-filter-group" role="tablist" aria-label="Filtres">
          {(
            Object.entries(FILTER_LABELS) as Array<[FilterKey, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`admin-filter-chip${filter === value ? " is-active" : ""}`}
              onClick={() => setFilter(value)}
            >
              {label} ({counts[value]})
            </button>
          ))}
        </div>
      </div>

      {errorMessage ? <p className="page-alert">{errorMessage}</p> : null}

      <div className="admin-prospects-summary" aria-label="Résumé des prospects">
        <div className="admin-summary-card">
          <strong>{counts.all}</strong>
          <span>praticiens suivis</span>
        </div>
        <div className="admin-summary-card">
          <strong>{counts.to_contact}</strong>
          <span>à contacter</span>
        </div>
        <div className="admin-summary-card">
          <strong>{counts.hidden}</strong>
          <span>masqués du site</span>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <p className="admin-prospects-empty">
          Aucun praticien ne correspond à votre recherche actuelle.
        </p>
      ) : (
        <ul className="admin-prospects-list">
          {visibleItems.map((practitioner) => {
            const state = getProspectStateFromStatus(practitioner.status);
            const addressLine = buildAddressLine(practitioner);
            const websiteUrl = normalizeUrl(practitioner.website);
            const isSaving = Boolean(savingSlugs[practitioner.slug]);

            return (
              <li className="admin-prospect-card" key={practitioner.slug}>
                <div className="admin-prospect-copy">
                  <div className="admin-prospect-header">
                    <div>
                      <h2 className="admin-prospect-name">
                        {practitioner.first_name} {practitioner.last_name}
                      </h2>
                      <p className="admin-prospect-meta">
                        {addressLine || "Adresse non renseignée"}
                      </p>
                    </div>

                    <div className="admin-prospect-badges">
                      <span
                        className={`admin-prospect-badge${
                          state.isVisible ? " is-visible" : " is-hidden"
                        }`}
                      >
                        {state.isVisible ? "Visible sur le site" : "Masqué du site"}
                      </span>
                      <span
                        className={`admin-prospect-badge${
                          state.isContacted ? " is-contacted" : " is-pending"
                        }`}
                      >
                        {state.isContacted ? "Déjà contacté" : "À contacter"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-prospect-links">
                    {practitioner.phone ? (
                      <a href={`tel:${practitioner.phone.trim()}`}>{practitioner.phone.trim()}</a>
                    ) : null}
                    {practitioner.email ? (
                      <a href={`mailto:${practitioner.email.trim()}`}>
                        {practitioner.email.trim()}
                      </a>
                    ) : null}
                    {websiteUrl ? (
                      <a href={websiteUrl} target="_blank" rel="noreferrer">
                        Site web
                      </a>
                    ) : null}
                    <Link href={`/naturopathe/${practitioner.slug}`} target="_blank">
                      Voir la fiche
                    </Link>
                  </div>
                </div>

                <div className="admin-prospect-actions">
                  <label className="admin-prospect-check">
                    <input
                      type="checkbox"
                      checked={state.isContacted}
                      disabled={isSaving}
                      onChange={() =>
                        updatePractitioner(practitioner, {
                          isContacted: !state.isContacted
                        })
                      }
                    />
                    <span>Contacté</span>
                  </label>

                  <label className="admin-prospect-check">
                    <input
                      type="checkbox"
                      checked={!state.isVisible}
                      disabled={isSaving}
                      onChange={() =>
                        updatePractitioner(practitioner, {
                          isVisible: !state.isVisible
                        })
                      }
                    />
                    <span>Retiré du site</span>
                  </label>

                  <p className="admin-prospect-status-text">
                    {isSaving ? "Enregistrement..." : "Mise à jour immédiate"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
