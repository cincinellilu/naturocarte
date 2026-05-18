"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IDF_DEPARTMENTS, getDepartmentByCode } from "@/lib/locations";

type ZoneFilterPanelProps = {
  zoneCode: string | null;
  activeZoneLabel: string;
};

export default function ZoneFilterPanel({ zoneCode, activeZoneLabel }: ZoneFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeDepartment = useMemo(
    () => (zoneCode ? getDepartmentByCode(zoneCode) : null),
    [zoneCode]
  );

  return (
    <section className={["zone-filter-panel", isOpen ? "zone-filter-panel--open" : null].filter(Boolean).join(" ")}>
      <div className="zone-filter-head">
        <div>
          <h2>Choisir une zone</h2>
          <p className="directory-caption">
            {activeDepartment
              ? `Zone actuelle : ${activeZoneLabel}.`
              : "Choisissez une zone pour filtrer la carte."}
          </p>
        </div>
        <div className="zone-filter-actions">
          {activeDepartment ? (
            <Link className="search-clear-btn" href="/carte">
              Réinitialiser
            </Link>
          ) : (
            <Link className="search-clear-btn" href="/annuaire-naturopathes">
              Annuaire
            </Link>
          )}
          <button
            type="button"
            className="zone-filter-toggle"
            aria-expanded={isOpen}
            aria-controls="zone-filter-options"
            onClick={() => setIsOpen((current) => !current)}
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
              className={["zone-filter-link", !activeDepartment ? "zone-filter-link--active" : null]
                .filter(Boolean)
                .join(" ")}
            >
              Toute l’Île-de-France
            </Link>

            {IDF_DEPARTMENTS.map((department) => (
              <Link
                key={department.code}
                href={`/carte?zone=${department.code}`}
                className={[
                  "zone-filter-link",
                  activeDepartment?.code === department.code ? "zone-filter-link--active" : null
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {department.code === "75" ? "Paris" : department.name}
              </Link>
            ))}
          </div>

          <p className="zone-filter-note">
            Pour Paris, vous pouvez aussi parcourir les arrondissements depuis{" "}
            <Link href="/naturopathe-paris">la page dédiée</Link>.
          </p>
        </>
      ) : null}
    </section>
  );
}
