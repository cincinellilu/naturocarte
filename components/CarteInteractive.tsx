"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import MapSkeleton from "@/components/MapSkeleton";
import ListSkeleton from "@/components/ListSkeleton";

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), {
  ssr: false,
  loading: () => <MapSkeleton />
});

const DEBOUNCE_MS = 300;
const DEFAULT_PROXIMITY = { lng: 2.3522, lat: 48.8566 };

type Practitioner = {
  slug: string;
  first_name: string;
  last_name: string;
  adresse: string | null;
  city: string | null;
  lat: number;
  lng: number;
};

type MapPoint = {
  slug: string;
  first_name: string;
  last_name: string;
  lat: number;
  lng: number;
  phone?: string | null;
  email?: string | null;
  booking_url?: string | null;
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

export default function CarteInteractive({
  practitioners,
  mapPoints
}: {
  practitioners: Practitioner[];
  mapPoints: MapPoint[];
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] = useState<"map" | "list" | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchCenter, setSearchCenter] = useState<SearchCenter | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isMapReady, setIsMapReady] = useState(!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
  const [showAll, setShowAll] = useState(false);

  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const filteredPractitioners = useMemo(() => {
    const referenceCenter = searchCenter
      ? { lat: searchCenter.lat, lng: searchCenter.lng }
      : userLocation ?? DEFAULT_PROXIMITY;

    return practitioners
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .map((p) => {
        const distanceKm = haversineDistanceKm(referenceCenter, {
          lat: p.lat,
          lng: p.lng
        });

        return {
          ...p,
          searchDistanceKm: searchCenter ? distanceKm : null,
          userDistanceKm: searchCenter ? null : distanceKm
        };
      })
      .sort((a, b) => {
        const distanceA = a.searchDistanceKm ?? a.userDistanceKm ?? Number.POSITIVE_INFINITY;
        const distanceB = b.searchDistanceKm ?? b.userDistanceKm ?? Number.POSITIVE_INFINITY;
        return distanceA - distanceB;
      });
  }, [practitioners, searchCenter, userLocation]);

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
    const query = searchQuery.trim();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (query.length < 3) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

      if (!token) {
        setSuggestions([]);
        setIsLoadingSuggestions(false);
        setIsSuggestionsOpen(true);
        return;
      }

      setIsLoadingSuggestions(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const params = new URLSearchParams({
          q: query,
          access_token: token,
          country: "fr",
          limit: "5",
          language: "fr",
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
      } catch {
        setSuggestions([]);
        setIsSuggestionsOpen(true);
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

  const handleMapSelect = (slug: string) => {
    setSelectionSource("map");
    setSelectedSlug(slug);
  };

  const handleListSelect = (slug: string) => {
    setSelectionSource("list");
    setSelectedSlug(slug);
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchCenter({ lng: suggestion.lng, lat: suggestion.lat, label: suggestion.label });
    setSearchQuery(suggestion.label);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleClearSearch = () => {
    setSearchCenter(null);
    setSearchQuery("");
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  };

  const showNoResults =
    isSuggestionsOpen &&
    !isLoadingSuggestions &&
    searchQuery.trim().length >= 3 &&
    suggestions.length === 0;

  return (
    <>
      <div ref={mapSectionRef} className="map-section">
        <div className="map-frame">
          <div ref={searchWrapperRef} className="search-box search-box--overlay">
            <label htmlFor="address-search" className="search-label">
              Rechercher une adresse
            </label>
            <input
              id="address-search"
              type="text"
              className="search-input"
              placeholder="Ex: 10 Rue de Rivoli, Paris"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsSuggestionsOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 3) setIsSuggestionsOpen(true);
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

          <MapboxMap
            points={mapPoints}
            selectedSlug={selectedSlug}
            selectionSource={selectionSource}
            onSelectSlug={handleMapSelect}
            searchCenter={searchCenter ? { lng: searchCenter.lng, lat: searchCenter.lat } : null}
            onReady={() => setIsMapReady(true)}
          />
        </div>
      </div>

      <h2>Praticiens référencés</h2>

      {searchCenter ? (
        <div className="search-results-head" aria-live="polite">
          <p>Tri par proximité autour de: {searchCenter.label}</p>
          <button type="button" className="search-clear-btn" onClick={handleClearSearch}>
            Effacer
          </button>
        </div>
      ) : null}

      {!isMapReady ? <ListSkeleton /> : null}

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
            typeof distanceKm === "number" ? `${distanceKm.toFixed(1).replace(".", ",")} km` : null;
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
              >
                <span className="practitioner-item-name">
                  {p.first_name} {p.last_name}
                </span>
                <span className="practitioner-item-meta">{p.adresse ?? "Adresse non renseignée"}</span>
                {distanceLabel ? (
                  <span className="practitioner-item-distance">Distance: {distanceLabel}</span>
                ) : null}
              </button>
              <Link href={`/naturopathe/${p.slug}`} className="practitioner-item-link">
                Voir la fiche
              </Link>
            </li>
          );
        })}
      </ul>

      {!showAll && filteredPractitioners.length > 5 ? (
        <div className="practitioner-list-cta">
          <button type="button" className="btn btn-secondary" onClick={() => setShowAll(true)}>
            Voir toute la liste
          </button>
        </div>
      ) : null}
    </>
  );
}
