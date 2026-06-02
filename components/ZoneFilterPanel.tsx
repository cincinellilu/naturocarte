"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { trackProductEvent } from "@/lib/product-events";
import { IDF_DEPARTMENTS, getDepartmentByCode } from "@/lib/locations";
import { PARIS_ARRONDISSEMENTS, toParisArrondissementLabel } from "@/lib/paris";

type DepartmentCityOption = {
  label: string;
  slug: string;
};

type ZoneFilterPanelProps = {
  zoneCode: string | null;
  subzoneCode: string | null;
  activeZoneLabel: string;
  activeSubzoneLabel: string | null;
  cityOptionsByDepartment: Record<string, DepartmentCityOption[]>;
};

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export default function ZoneFilterPanel({
  zoneCode,
  subzoneCode,
  activeZoneLabel,
  activeSubzoneLabel,
  cityOptionsByDepartment
}: ZoneFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(Boolean(zoneCode));
  const [subzoneSearch, setSubzoneSearch] = useState("");

  const activeDepartment = useMemo(
    () => (zoneCode ? getDepartmentByCode(zoneCode) : null),
    [zoneCode]
  );

  const activeSubzoneKey = useMemo(
    () => (subzoneCode ? subzoneCode.trim().toLowerCase() : null),
    [subzoneCode]
  );

  const isParis = activeDepartment?.code === "75";

  useEffect(() => {
    setSubzoneSearch("");
  }, [zoneCode]);

  const subzoneOptions = useMemo(() => {
    if (!activeDepartment) return [];

    if (isParis) {
      return PARIS_ARRONDISSEMENTS.map((arrondissement) => ({
        label: `Paris ${toParisArrondissementLabel(arrondissement)}`,
        slug: String(arrondissement)
      }));
    }

    return cityOptionsByDepartment[activeDepartment.code] ?? [];
  }, [activeDepartment, cityOptionsByDepartment, isParis]);

  const filteredSubzoneOptions = useMemo(() => {
    const query = normalizeSearchValue(subzoneSearch);
    if (!query) return subzoneOptions;

    return subzoneOptions.filter((option) => normalizeSearchValue(option.label).includes(query));
  }, [subzoneOptions, subzoneSearch]);

  const subzoneLabel = isParis ? "arrondissement" : "ville";

  return (
    <section
      id="zone-filter-panel"
      className={["zone-filter-panel", isOpen ? "zone-filter-panel--open" : null]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="zone-filter-head">
        <div>
          <h2>Choisir une zone</h2>
          <p className="directory-caption">
            {activeDepartment
              ? activeSubzoneLabel
                ? `Zone actuelle : ${activeZoneLabel} · ${activeSubzoneLabel}.`
                : `Zone actuelle : ${activeZoneLabel}.`
              : "Choisissez une zone pour filtrer la carte."}
          </p>
        </div>
        <div className="zone-filter-actions">
          {activeDepartment ? (
            <Link
              className="search-clear-btn"
              href="/carte"
              onClick={() =>
                trackProductEvent("map_filter_reset", {
                  previous_zone: activeDepartment.code,
                  previous_subzone: activeSubzoneKey
                })
              }
            >
              Réinitialiser
            </Link>
          ) : null}
          <button
            type="button"
            className="zone-filter-toggle"
            aria-expanded={isOpen}
            aria-controls="zone-filter-options"
            onClick={() =>
              setIsOpen((current) => {
                trackProductEvent(current ? "map_filter_closed" : "map_filter_opened", {
                  zone: activeDepartment?.code ?? null
                });
                return !current;
              })
            }
          >
            {isOpen ? "Masquer les filtres" : "Filtrer par zone"}
          </button>
        </div>
      </div>

      {isOpen ? (
        <>
          <div className="zone-filter-links zone-filter-links--scroll" id="zone-filter-options">
            <Link
              href="/carte"
              onClick={() =>
                trackProductEvent("map_filter_selected", {
                  level: "region",
                  zone: "idf"
                })
              }
              className={["zone-filter-link", !zoneCode ? "zone-filter-link--active" : null]
                .filter(Boolean)
                .join(" ")}
            >
              Toute l’Île-de-France
            </Link>

            {IDF_DEPARTMENTS.map((department) => (
              <Link
                key={department.code}
                href={`/carte?zone=${department.code}`}
                onClick={() =>
                  trackProductEvent("map_filter_selected", {
                    level: "department",
                    zone: department.code
                  })
                }
                className={[
                  "zone-filter-link",
                  zoneCode === department.code ? "zone-filter-link--active" : null
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {department.code === "75" ? "Paris" : department.name}
              </Link>
            ))}
          </div>

          {activeDepartment ? (
            <div className="zone-filter-subpanel" id="zone-filter-sub-options">
              <p className="directory-caption zone-filter-subzone-caption">
                Choisissez un arrondissement/ville ou revenez à la liste des départements.
              </p>

              <div className="zone-filter-links zone-filter-links--scroll zone-filter-links--subzone">
                <div className="zone-filter-subzone-search-item">
                  <input
                    id="zone-subzone-search"
                    type="search"
                    className="search-input zone-filter-search-input"
                    placeholder={isParis ? "Paris 11, 14, 17..." : "Versailles, Nanterre..."}
                    value={subzoneSearch}
                    onChange={(event) => setSubzoneSearch(event.target.value)}
                    autoComplete="off"
                  />
                </div>

                {filteredSubzoneOptions.length > 0 ? (
                  filteredSubzoneOptions.map((option) => {
                    const href = `/carte?zone=${activeDepartment.code}&subzone=${encodeURIComponent(
                      option.slug
                    )}`;
                    const isActive = activeSubzoneKey === option.slug;

                    return (
                      <Link
                        key={option.slug}
                        href={href}
                        onClick={() =>
                          trackProductEvent("map_filter_selected", {
                            level: isParis ? "arrondissement" : "city",
                            zone: activeDepartment.code,
                            subzone: option.slug
                          })
                        }
                        className={[
                          "zone-filter-link",
                          isActive ? "zone-filter-link--active" : null
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {option.label}
                      </Link>
                    );
                  })
                ) : (
                  <p className="zone-filter-empty">
                    Aucun {subzoneLabel} ne correspond à votre recherche.
                  </p>
                )}
              </div>

            </div>
          ) : (
            <p className="zone-filter-note">
              Pour Paris, vous pouvez aussi parcourir les arrondissements depuis{" "}
              <Link href="/naturopathe-paris">la page dédiée</Link>.
            </p>
          )}
        </>
      ) : null}
    </section>
  );
}
