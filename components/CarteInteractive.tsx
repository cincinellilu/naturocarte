"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import PartnerBadge from "@/components/PartnerBadge";
import PractitionerEntryLink from "@/components/PractitionerEntryLink";
import { trackProductEvent } from "@/lib/product-events";
import {
  getDepartmentByCode,
  getDepartmentCodeFromPostalCode
} from "@/lib/locations";

const DEBOUNCE_MS = 300;
const DEFAULT_PROXIMITY = { lng: 2.3522, lat: 48.8566 };

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), {
  ssr: false,
  loading: () => <div className="map-fallback map-fallback--loading">Carte interactive en cours de chargement…</div>
});

type Practitioner = {
  slug: string;
  first_name: string;
  last_name: string;
  adresse: string | null;
  postal_code: string | null;
  city: string | null;
  lat: number;
  lng: number;
  is_partner?: boolean;
};

type MapPoint = {
  slug: string;
  first_name: string;
  last_name: string;
  postal_code: string | null;
  lat: number;
  lng: number;
  phone?: string | null;
  email?: string | null;
  booking_url?: string | null;
  description?: string | null;
  rating?: number | null;
  tarifs?: string | null;
  photo_url?: string | null;
  is_partner?: boolean;
};

type SearchCenter = { lng: number; lat: number; label: string };

type SearchSuggestion = {
  id: string;
  label: string;
  lng: number;
  lat: number;
};

type Coordinates = { lat: number; lng: number };

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export type CarteInteractiveProps = {
  practitioners: Practitioner[];
  mapPoints: MapPoint[];
  zoneCode?: string | null;
  activeSubzoneLabel?: string | null;
  activeLocationLabel?: string | null;
  activeLocationSummary?: string | null;
};

export default function CarteInteractive({
  practitioners,
  mapPoints,
  zoneCode = null,
  activeSubzoneLabel = null,
  activeLocationLabel = null,
  activeLocationSummary = null
}: CarteInteractiveProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] = useState<"map" | "list" | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchCenter, setSearchCenter] = useState<SearchCenter | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [locateRequestNonce, setLocateRequestNonce] = useState(0);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const suppressAutocompleteRef = useRef(false);

  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const mapFrameRef = useRef<HTMLDivElement | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeDepartment = zoneCode ? getDepartmentByCode(zoneCode) : null;
  const activeZoneLabel = activeDepartment?.name ?? "Île-de-France";

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const handleQuickNavClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>(".map-mobile-action-link[data-scroll-target]");
      const targetId = link?.dataset.scrollTarget;
      const scrollTarget = targetId ? document.getElementById(targetId) : null;
      if (!link || !targetId || !scrollTarget) return;

      event.preventDefault();
      trackProductEvent("map_mobile_quick_nav_clicked", {
        target: targetId
      });

      const headerOffset = window.matchMedia("(max-width: 760px)").matches ? 112 : 24;
      const top = scrollTarget.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: "smooth"
      });
    };

    document.addEventListener("click", handleQuickNavClick);

    return () => {
      document.removeEventListener("click", handleQuickNavClick);
    };
  }, []);

  useEffect(() => {
    const target = mapFrameRef.current;
    if (!target || shouldLoadMap) return;

    if (!("IntersectionObserver" in window)) {
      const timeout = globalThis.setTimeout(() => setShouldLoadMap(true), 1200);
      return () => globalThis.clearTimeout(timeout);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px" }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoadMap]);

  useEffect(() => {
    if (!activeDepartment) return;

    setSelectedSlug(null);
    setSelectionSource(null);
    setSearchCenter(null);
    setSearchQuery("");
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setShowAll(false);
  }, [activeDepartment?.code]);

  const visibleMapPoints = useMemo(() => {
    if (!activeDepartment) return mapPoints;

    return mapPoints.filter(
      (point) => getDepartmentCodeFromPostalCode(point.postal_code) === activeDepartment.code
    );
  }, [activeDepartment, mapPoints]);

  const filteredPractitioners = useMemo(() => {
    const referenceCenter = searchCenter
      ? { lat: searchCenter.lat, lng: searchCenter.lng }
      : hasMounted
        ? userLocation
        : null;

    return practitioners
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .filter((p) => {
        if (!activeDepartment) return true;
        return getDepartmentCodeFromPostalCode(p.postal_code) === activeDepartment.code;
      })
      .map((p) => {
        const distanceKm = referenceCenter
          ? haversineDistanceKm(referenceCenter, {
              lat: p.lat,
              lng: p.lng
            })
          : null;

        return {
          ...p,
          searchDistanceKm: searchCenter ? distanceKm : null,
          userDistanceKm: searchCenter ? null : distanceKm
        };
      })
      .sort((a, b) => {
        if (!referenceCenter) return 0;

        const distanceA = a.searchDistanceKm ?? a.userDistanceKm ?? Number.POSITIVE_INFINITY;
        const distanceB = b.searchDistanceKm ?? b.userDistanceKm ?? Number.POSITIVE_INFINITY;
        return distanceA - distanceB;
      });
  }, [activeDepartment, hasMounted, practitioners, searchCenter, userLocation]);

  useEffect(() => {
    setShowAll(false);
  }, [activeDepartment?.code]);

  useEffect(() => {
    if (!selectedSlug) return;

    const selectedStillVisible = visibleMapPoints.some((point) => point.slug === selectedSlug);
    if (!selectedStillVisible) {
      setSelectedSlug(null);
      setSelectionSource(null);
    }
  }, [selectedSlug, visibleMapPoints]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      () => {
        setUserLocation(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000
      }
    );
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!searchWrapperRef.current) return;
      if (!searchWrapperRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSuggestionsOpen(false);
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!isFullscreen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const query = searchQuery.trim();

    if (suppressAutocompleteRef.current) {
      suppressAutocompleteRef.current = false;
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (query.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) {
          throw new Error("Missing Mapbox token");
        }

        const params = new URLSearchParams({
          q: query,
          access_token: token,
          country: "fr",
          limit: "5",
          language: "fr",
          autocomplete: "true",
          proximity: `${DEFAULT_PROXIMITY.lng},${DEFAULT_PROXIMITY.lat}`
        });

        const response = await fetch(
          `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`,
          { method: "GET", signal: controller.signal }
        );

        if (!response.ok) throw new Error("Mapbox geocoding failed");

        const payload = (await response.json()) as {
          features?: Array<{
            id?: string;
            geometry?: { coordinates?: [number, number] };
            properties?: { full_address?: string; name?: string };
            place_name?: string;
            name?: string;
          }>;
        };

        const nextSuggestions: SearchSuggestion[] = (payload.features ?? [])
          .map((feature) => {
            const coords = feature.geometry?.coordinates;
            if (!coords || coords.length < 2) return null;

            return {
              id: feature.id ?? `${coords[0]}-${coords[1]}`,
              label:
                feature.properties?.full_address ??
                feature.place_name ??
                feature.properties?.name ??
                feature.name ??
                query,
              lng: coords[0],
              lat: coords[1]
            };
          })
          .filter((s): s is SearchSuggestion => Boolean(s));

        setSuggestions(nextSuggestions);
        setIsSuggestionsOpen(true);
        trackProductEvent(
          nextSuggestions.length > 0 ? "map_search_suggestions_loaded" : "map_search_no_results",
          {
            query_length: query.length,
            suggestions_count: nextSuggestions.length
          }
        );
      } catch {
        setSuggestions([]);
        setIsSuggestionsOpen(true);
        trackProductEvent("geocoding_failed", {
          source: "map_search",
          query_length: query.length
        });
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [searchQuery]);

  const handleMapSelect = (slug: string | null) => {
    setShouldLoadMap(true);

    if (!slug) {
      setSelectionSource(null);
      setSelectedSlug(null);
      return;
    }

    setSelectionSource("map");
    setSelectedSlug(slug);
  };

  const handleListSelect = (slug: string) => {
    trackProductEvent("map_list_practitioner_clicked", {
      practitioner_slug: slug
    });
    setShouldLoadMap(true);
    setSelectionSource("list");
    setSelectedSlug(slug);
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    trackProductEvent("map_search_suggestion_selected", {
      query_length: searchQuery.trim().length,
      suggestions_count: suggestions.length
    });
    setSearchCenter({ lng: suggestion.lng, lat: suggestion.lat, label: suggestion.label });
    setShouldLoadMap(true);
    suppressAutocompleteRef.current = true;
    setSearchQuery(suggestion.label);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    searchInputRef.current?.blur();
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleClearSearch = () => {
    trackProductEvent("map_search_cleared");
    setSearchCenter(null);
    setSearchQuery("");
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  };

  const handleLocateClick = () => {
    trackProductEvent("map_geolocation_clicked");
    setShouldLoadMap(true);
    setLocateRequestNonce((current) => current + 1);
  };

  const handleToggleFullscreen = () => {
    setShouldLoadMap(true);
    setIsFullscreen((current) => {
      trackProductEvent(current ? "map_fullscreen_closed" : "map_fullscreen_opened");
      return !current;
    });
  };

  const showNoResults =
    isSuggestionsOpen &&
    !isLoadingSuggestions &&
    searchQuery.trim().length >= 2 &&
    suggestions.length === 0;
  const isMobileSearchCollapsed = Boolean(searchCenter) && !isSuggestionsOpen;

  const resultsTitle = activeDepartment
    ? activeSubzoneLabel
      ? `Praticiens à ${activeLocationLabel ?? activeSubzoneLabel}`
      : activeDepartment.code === "75"
        ? "Praticiens à Paris"
        : `Praticiens en ${activeDepartment.name}`
    : "Praticiens autour de vous";

  const resultsCaption = activeDepartment
    ? activeLocationSummary ??
      `Les résultats sont limités à ${activeZoneLabel}. Utilisez ensuite la recherche d’adresse pour classer les fiches autour de vous.`
    : "Commencez par une zone ou entrez directement votre adresse pour faire remonter les praticiens les plus proches.";

  return (
    <div className="map-experience">
      <div ref={mapSectionRef} className="map-stage" id="carte-interactive">
        <div
          ref={mapFrameRef}
          className={[
            "map-frame",
            isFullscreen ? "map-frame--fullscreen" : null,
            selectedSlug ? "map-frame--practitioner-open" : null
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div
            ref={searchWrapperRef}
            className={[
              "search-box",
              "search-box--overlay",
              selectedSlug || isMobileSearchCollapsed ? "search-box--hidden-mobile" : null
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="search-card">
              <label htmlFor="address-search" className="search-label">
                Rechercher une adresse
              </label>
              <input
                id="address-search"
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="10 Rue de Rivoli, Paris ou Versailles"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setIsSuggestionsOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setIsSuggestionsOpen(true);
                }}
                autoComplete="off"
              />

              {isSuggestionsOpen ? (
                <div className="search-dropdown">
                  {isLoadingSuggestions ? <p className="search-status">Recherche...</p> : null}
                  {showNoResults ? <p className="search-status">Aucun résultat</p> : null}
                  {!isLoadingSuggestions && suggestions.length > 0 ? (
                    <ul className="search-suggestions">
                      {suggestions.map((suggestion) => (
                        <li key={suggestion.id}>
                          <button
                            type="button"
                            className="search-suggestion-btn"
                            onClick={() => handleSelectSuggestion(suggestion)}
                          >
                            {suggestion.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {searchCenter && isMobileSearchCollapsed && !selectedSlug ? (
            <button
              type="button"
              className="map-mobile-search-toggle"
              onClick={() => {
                setIsSuggestionsOpen(true);
                window.requestAnimationFrame(() => {
                  searchInputRef.current?.focus();
                  searchInputRef.current?.select();
                });
              }}
            >
              Modifier l’adresse
            </button>
          ) : null}

          {isFullscreen ? (
            <button
              type="button"
              className="map-mobile-close-fullscreen"
              onClick={handleToggleFullscreen}
              aria-label="Fermer le plein écran"
            >
              <span aria-hidden="true">×</span>
              <strong>Fermer</strong>
            </button>
          ) : null}

          {shouldLoadMap ? (
            <MapboxMap
              points={visibleMapPoints}
              selectedSlug={selectedSlug}
              selectionSource={selectionSource}
              onSelectSlug={handleMapSelect}
              searchCenter={searchCenter ? { lng: searchCenter.lng, lat: searchCenter.lat } : null}
              activeZoneCode={activeDepartment?.code ?? null}
              locateRequestNonce={locateRequestNonce}
              onGeoErrorChange={setGeoError}
              isFullscreen={isFullscreen}
            />
          ) : (
            <div className="map-fallback map-fallback--loading">Carte interactive en cours de chargement…</div>
          )}

          <div
            className={[
              "map-frame-controls",
              selectedSlug ? "map-frame-controls--hidden-mobile" : null
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="map-overlay-controls">
              <button
                type="button"
                className="map-fullscreen-btn"
                onClick={handleToggleFullscreen}
                aria-label={isFullscreen ? "Quitter le plein écran" : "Ouvrir la carte en plein écran"}
                title={isFullscreen ? "Quitter le plein écran" : "Ouvrir la carte en plein écran"}
                aria-pressed={isFullscreen}
              >
                <span className="map-control-icon" aria-hidden="true">
                  {isFullscreen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path
                        d="M9 15H5v4M15 9h4V5M19 15h-4v4M5 9h4V5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path
                        d="M9 5H5v4M15 5h4v4M19 15v4h-4M5 15v4h4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </button>

              <button type="button" className="map-locate-btn" onClick={handleLocateClick}>
                Me localiser
              </button>
            </div>

            {geoError ? <p className="map-overlay-error">{geoError}</p> : null}
          </div>

        </div>
      </div>

      <section className="results-panel" id="praticiens-results">
        <div className="results-panel-head">
          <div>
            <h2 suppressHydrationWarning>{resultsTitle}</h2>
            <p className="directory-caption">{resultsCaption}</p>
          </div>
          <span className="directory-count">{filteredPractitioners.length}</span>
        </div>

        {activeDepartment ? (
          <div className="zone-summary" aria-live="polite">
            <p>
              Vous consultez actuellement la zone <strong>{activeZoneLabel}</strong>.
            </p>
            <Link className="meta-link" href="/carte#zone-filter-panel">
              Revenir au choix des zones
            </Link>
          </div>
        ) : null}

        {searchCenter ? (
          <div className="search-results-head" aria-live="polite">
            <p>Autour de {searchCenter.label}</p>
            <button type="button" className="search-clear-btn" onClick={handleClearSearch}>
              Effacer
            </button>
          </div>
        ) : null}

        {filteredPractitioners.length === 0 ? (
          <div className="results-empty">
            <p>
              {activeDepartment
                ? `Aucun praticien publié pour le moment dans ${activeZoneLabel}.`
                : "Aucun praticien publié pour le moment."}
            </p>
          </div>
        ) : (
          <>
            <ul className="practitioner-list">
              {filteredPractitioners.map((p, index) => {
                const isActive = selectedSlug === p.slug;
                const distanceKm =
                  typeof p.searchDistanceKm === "number"
                    ? p.searchDistanceKm
                    : typeof p.userDistanceKm === "number"
                      ? p.userDistanceKm
                      : null;
                const distanceLabel =
                  typeof distanceKm === "number"
                    ? `${distanceKm.toFixed(1).replace(".", ",")} km`
                    : null;
                const isHidden = !showAll && index >= 5;

                return (
                  <li
                    key={p.slug}
                    className={[
                      isActive ? "practitioner-item--active" : null,
                      isHidden ? "practitioner-item--hidden" : null
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden={isHidden ? "true" : undefined}
                  >
                    <button
                      type="button"
                      className="practitioner-item-button"
                      onClick={() => handleListSelect(p.slug)}
                      aria-pressed={isActive}
                      aria-label={`Afficher ${p.first_name} ${p.last_name} sur la carte`}
                    >
                      <span className="practitioner-item-head">
                        <span className="practitioner-item-name">
                          {p.first_name} {p.last_name}
                        </span>
                        {p.is_partner ? <PartnerBadge className="partner-badge--inline" /> : null}
                      </span>
                      <span className="practitioner-item-meta">
                        {[p.adresse, p.city].filter(Boolean).join(", ") || "Adresse non renseignée"}
                      </span>
                    </button>
                    {distanceLabel ? (
                      <span className="practitioner-item-distance">{distanceLabel}</span>
                    ) : null}
                    <PractitionerEntryLink
                      href={`/naturopathe/${p.slug}`}
                      className="practitioner-item-link"
                      practitionerSlug={p.slug}
                      source="map_list"
                    >
                      <span>Voir la fiche</span>
                      <span className="practitioner-item-link-icon" aria-hidden="true">
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                          <path d="M5 11 11 5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M6 5h5v5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </PractitionerEntryLink>
                  </li>
                );
              })}
            </ul>

            {!showAll && filteredPractitioners.length > 5 ? (
              <div className="practitioner-list-cta">
                <button
                  type="button"
                  className="btn btn-secondary practitioner-list-more-btn"
                  onClick={() => {
                    trackProductEvent("map_results_show_more_clicked", {
                      visible_count: 5,
                      total_count: filteredPractitioners.length
                    });
                    setShowAll(true);
                  }}
                >
                  Voir plus
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
