"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { trackPractitionerStat, type PractitionerStatEvent } from "@/components/PractitionerStatsTracker";

const PARIS_CENTER: [number, number] = [2.3522, 48.8566];
const SOURCE_ID = "practitioners";
const CLUSTERS_LAYER_ID = "clusters";
const CLUSTER_COUNT_LAYER_ID = "cluster-count";
const UNCLUSTERED_LAYER_ID = "unclustered-point";

type MapPoint = {
  slug: string;
  first_name: string;
  last_name: string;
  lat: number;
  lng: number;
  phone?: string | null;
  email?: string | null;
  booking_url?: string | null;
  description?: string | null;
  rating?: number | null;
  tarifs?: string | null;
  photo_url?: string | null;
};

type SelectionSource = "map" | "list" | null;
type SearchCenter = { lng: number; lat: number } | null;

function shouldReduceMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobileViewportNow(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(max-width: 640px)").matches;
}

function getPopupPadding() {
  if (isMobileViewportNow()) {
    return { top: 280, bottom: 96, left: 24, right: 24 };
  }

  return { top: 160, bottom: 120, left: 60, right: 60 };
}

function moveMap(
  map: mapboxgl.Map,
  options: {
    center: [number, number];
    zoom?: number;
    mode?: "fly" | "ease";
    padding?: mapboxgl.PaddingOptions;
  }
) {
  const reduceMotion = shouldReduceMotion();
  const cameraOptions = {
    center: options.center,
    zoom: options.zoom,
    padding: options.padding
  };

  if (reduceMotion) {
    map.jumpTo(cameraOptions);
    return;
  }

  if (options.mode === "fly") {
    map.flyTo({ ...cameraOptions, speed: 1.2 });
    return;
  }

  map.easeTo({ ...cameraOptions, duration: 550 });
}

function hideNonEssentialLayers(map: mapboxgl.Map) {
  const style = map.getStyle();
  if (!style.layers) return;

  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    const sourceLayer =
      (layer as { "source-layer"?: string })["source-layer"]?.toLowerCase() ?? "";
    const isPoiLayer = id.includes("poi") || sourceLayer.includes("poi");
    const isTransitLayer = id.includes("transit") || sourceLayer.includes("transit");
    const isAmenityOrShop =
      id.includes("shop") ||
      id.includes("amenity") ||
      sourceLayer.includes("shop") ||
      sourceLayer.includes("amenity");

    if (isPoiLayer || isTransitLayer || isAmenityOrShop) {
      try {
        map.setLayoutProperty(layer.id, "visibility", "none");
      } catch {
        // Some layers do not support a visibility layout property.
      }
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function truncateText(value: string, maxLength: number): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;

  const slice = compact.slice(0, maxLength).trimEnd();
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 40 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}

function buildPopupHtml(point: MapPoint): string {
  const bookingUrl =
    typeof point.booking_url === "string" &&
    (point.booking_url.startsWith("http://") || point.booking_url.startsWith("https://"))
      ? point.booking_url
      : null;
  const ratingValue =
    typeof point.rating === "number" && Number.isFinite(point.rating) ? point.rating : null;
  const description = point.description?.trim() ? point.description.trim() : null;
  const descriptionPreview = description ? truncateText(description, 160) : null;
  const photoLabel = `${point.first_name} ${point.last_name}`;
  const initials = `${point.first_name?.charAt(0) ?? ""}${point.last_name?.charAt(0) ?? ""}`
    .trim()
    .toUpperCase();
  const phoneHref = point.phone ? point.phone.replace(/[^\d+]/g, "") : "";

  const phoneLine = point.phone
    ? `<p class="map-popup-detail">
        <span class="map-popup-label">Telephone</span>
        <a
          class="map-popup-value"
          href="tel:${escapeHtml(phoneHref)}"
          data-practitioner-stat-event="contact_click"
          data-practitioner-slug="${escapeHtml(point.slug)}"
        >${escapeHtml(point.phone)}</a>
      </p>`
    : "";
  const emailLine = point.email
    ? `<p class="map-popup-detail">
        <span class="map-popup-label">Email</span>
        <a
          class="map-popup-value"
          href="mailto:${encodeURIComponent(point.email)}"
          data-practitioner-stat-event="contact_click"
          data-practitioner-slug="${escapeHtml(point.slug)}"
        >${escapeHtml(point.email)}</a>
      </p>`
    : "";
  const bookingLine = bookingUrl
    ? `<a class="map-popup-secondary" href="${escapeHtml(
        bookingUrl
      )}" target="_blank" rel="noopener noreferrer" data-practitioner-stat-event="booking_click" data-practitioner-slug="${escapeHtml(
        point.slug
      )}">Prendre rendez-vous</a>`
    : "";
  const tarifsLine = point.tarifs?.trim()
    ? `<a class="map-popup-secondary" href="/naturopathe/${encodeURIComponent(
        point.slug
      )}#tarifs">Voir les tarifs</a>`
    : "";
  const ratingLine = ratingValue
    ? `<div class="map-popup-rating" aria-label="Note ${ratingValue.toFixed(1)} sur 5">
        <span class="map-popup-rating-star">★</span>
        <span class="map-popup-rating-value">${ratingValue.toFixed(1)}</span>
      </div>`
    : "";
  const photoMarkup = point.photo_url?.trim()
    ? `<img class="map-popup-photo-image" src="${escapeHtml(
        point.photo_url.trim()
      )}" alt="${escapeHtml(photoLabel)}" loading="lazy" />`
    : `<div class="map-popup-photo-placeholder" aria-hidden="true">
        <span class="map-popup-photo-initials">${escapeHtml(initials || "NC")}</span>
      </div>`;

  return `<div class="map-popup">
    <button class="map-popup-close" type="button" aria-label="Fermer la fiche">×</button>
    <div class="map-popup-layout">
      <div class="map-popup-left">
        <div class="map-popup-visual">${photoMarkup}</div>
        ${
          descriptionPreview
            ? `<p class="map-popup-description">${escapeHtml(descriptionPreview)}</p>`
            : ""
        }
        <a class="map-popup-link" href="/naturopathe/${encodeURIComponent(point.slug)}">Voir la fiche</a>
        <form class="map-popup-favorite-form" action="/api/user-favorites" method="post">
          <input type="hidden" name="practitioner_slug" value="${escapeHtml(point.slug)}" />
          <input type="hidden" name="intent" value="add" />
          <button class="map-popup-favorite-btn" type="submit">Ajouter aux favoris</button>
        </form>
      </div>
      <div class="map-popup-content">
        <p class="map-popup-name">${escapeHtml(point.first_name)} ${escapeHtml(point.last_name)}</p>
        ${ratingLine}
        ${
          phoneLine || emailLine
            ? `<div class="map-popup-details">${phoneLine}${emailLine}</div>`
            : ""
        }
        <div class="map-popup-actions">
          ${bookingLine}
          ${tarifsLine}
        </div>
      </div>
    </div>
  </div>`;
}

function buildPhoneHref(value?: string | null): string {
  return value ? value.replace(/[^\d+]/g, "") : "";
}

function MobilePractitionerPopup({
  point,
  onClose
}: {
  point: MapPoint;
  onClose: () => void;
}) {
  const bookingUrl =
    typeof point.booking_url === "string" &&
    (point.booking_url.startsWith("http://") || point.booking_url.startsWith("https://"))
      ? point.booking_url
      : null;
  const ratingValue =
    typeof point.rating === "number" && Number.isFinite(point.rating) ? point.rating : null;
  const description = point.description?.trim() ? point.description.trim() : null;
  const descriptionPreview = description ? truncateText(description, 138) : null;
  const initials = `${point.first_name?.charAt(0) ?? ""}${point.last_name?.charAt(0) ?? ""}`
    .trim()
    .toUpperCase();
  const phoneHref = buildPhoneHref(point.phone);
  const hasTarifs = Boolean(point.tarifs?.trim());

  return (
    <div className="map-mobile-overlay" role="presentation">
      <section
        className="map-mobile-popup"
        role="dialog"
        aria-modal="true"
        aria-label={`${point.first_name} ${point.last_name}`}
      >
        <button
          type="button"
          className="map-mobile-popup-close"
          onClick={onClose}
          aria-label="Fermer la fiche"
        >
          ×
        </button>

        <div className="map-mobile-popup-photo" aria-hidden="true">
          {point.photo_url?.trim() ? (
            <img
              className="map-mobile-popup-photo-image"
              src={point.photo_url.trim()}
              alt=""
              loading="lazy"
            />
          ) : (
            <div className="map-mobile-popup-photo-placeholder">
              <span className="map-mobile-popup-photo-initials">{initials || "NC"}</span>
            </div>
          )}
        </div>

        <div className="map-mobile-popup-content">
          <p className="map-popup-name">
            {point.first_name} {point.last_name}
          </p>

          {ratingValue ? (
            <div className="map-popup-rating" aria-label={`Note ${ratingValue.toFixed(1)} sur 5`}>
              <span className="map-popup-rating-star">★</span>
              <span className="map-popup-rating-value">{ratingValue.toFixed(1)}</span>
            </div>
          ) : null}

          {descriptionPreview ? (
            <p className="map-mobile-popup-description">{descriptionPreview}</p>
          ) : null}

          {point.phone || point.email ? (
            <div className="map-popup-details map-mobile-popup-details">
              {point.phone ? (
                <p className="map-popup-detail">
                  <span className="map-popup-label">Téléphone</span>
                  <a
                    className="map-popup-value"
                    href={`tel:${phoneHref}`}
                    onClick={() => trackPractitionerStat(point.slug, "contact_click")}
                  >
                    {point.phone}
                  </a>
                </p>
              ) : null}
              {point.email ? (
                <p className="map-popup-detail">
                  <span className="map-popup-label">Email</span>
                  <a
                    className="map-popup-value"
                    href={`mailto:${encodeURIComponent(point.email)}`}
                    onClick={() => trackPractitionerStat(point.slug, "contact_click")}
                  >
                    {point.email}
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="map-popup-actions map-mobile-popup-actions">
            <form className="map-popup-favorite-form map-mobile-popup-favorite-form" action="/api/user-favorites" method="post">
              <input type="hidden" name="practitioner_slug" value={point.slug} />
              <input type="hidden" name="intent" value="add" />
              <button className="map-popup-favorite-btn map-mobile-popup-favorite-btn" type="submit">
                Ajouter aux favoris
              </button>
            </form>

            {bookingUrl ? (
              <a
                className="map-popup-link map-mobile-popup-link"
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackPractitionerStat(point.slug, "booking_click")}
              >
                Prendre rendez-vous
              </a>
            ) : null}

            {hasTarifs ? (
              <a
                className="map-popup-secondary map-mobile-popup-secondary"
                href={`/naturopathe/${encodeURIComponent(point.slug)}#tarifs`}
              >
                Voir les tarifs
              </a>
            ) : null}

            <a
              className={[
                bookingUrl ? "map-popup-secondary" : "map-popup-link",
                "map-mobile-popup-link",
                bookingUrl ? "map-mobile-popup-secondary" : null
              ]
                .filter(Boolean)
                .join(" ")}
              href={`/naturopathe/${encodeURIComponent(point.slug)}`}
            >
              Voir la fiche
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function toFeatureCollection(points: MapPoint[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      id: point.slug,
      geometry: { type: "Point", coordinates: [point.lng, point.lat] },
      properties: {
        slug: point.slug,
        first_name: point.first_name,
        last_name: point.last_name
      }
    }))
  };
}

function addPractitionersSourceAndLayers(map: mapboxgl.Map, points: MapPoint[]) {
  const featureCollection = toFeatureCollection(points);
  const existingSource = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;

  if (existingSource) {
    existingSource.setData(featureCollection);
  } else {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: featureCollection,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });
  }

  if (!map.getLayer(CLUSTERS_LAYER_ID)) {
    map.addLayer({
      id: CLUSTERS_LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#09110c",
        "circle-radius": ["step", ["get", "point_count"], 18, 10, 22, 30, 28],
        "circle-opacity": 0.85
      }
    });
  }

  if (!map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
    map.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: "symbol",
      source: SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": 12
      },
      paint: { "text-color": "#ffffff" }
    });
  }

  if (!map.getLayer(UNCLUSTERED_LAYER_ID)) {
    map.addLayer({
      id: UNCLUSTERED_LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          "#0f9d52",
          "#09110c"
        ],
        "circle-radius": ["case", ["boolean", ["feature-state", "selected"], false], 10, 8],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ecfdf4"
      }
    });
  }
}

function fitMapToPoints(map: mapboxgl.Map, points: MapPoint[]) {
  const validPoints = points.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));

  if (validPoints.length === 0) return;

  if (validPoints.length === 1) {
    moveMap(map, {
      center: [validPoints[0].lng, validPoints[0].lat],
      zoom: 12.4,
      mode: "ease"
    });
    return;
  }

  const bounds = new mapboxgl.LngLatBounds();
  for (const point of validPoints) {
    bounds.extend([point.lng, point.lat]);
  }

  const reduceMotion = shouldReduceMotion();
  map.fitBounds(bounds, {
    padding: 56,
    maxZoom: 12.5,
    duration: reduceMotion ? 0 : 650,
    essential: !reduceMotion
  });
}

export default function MapboxMap({
  points,
  selectedSlug = null,
  selectionSource = null,
  onSelectSlug,
  searchCenter = null,
  activeZoneCode = null,
  locateRequestNonce = 0,
  onGeoErrorChange,
  isFullscreen = false
}: {
  points: MapPoint[];
  selectedSlug?: string | null;
  selectionSource?: SelectionSource;
  onSelectSlug?: (slug: string | null) => void;
  searchCenter?: SearchCenter;
  activeZoneCode?: string | null;
  locateRequestNonce?: number;
  onGeoErrorChange?: (error: string | null) => void;
  isFullscreen?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const interactionsBoundRef = useRef(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const previousSelectedSlugRef = useRef<string | null>(null);
  const trackedPopupViewSlugRef = useRef<string | null>(null);
  const onSelectSlugRef = useRef<typeof onSelectSlug>(onSelectSlug);
  const pointsRef = useRef<MapPoint[]>(points);

  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerElementRef = useRef<HTMLDivElement | null>(null);
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const searchMarkerElementRef = useRef<HTMLDivElement | null>(null);
  const autoGeoAttemptedRef = useRef(false);

  const [geoError, setGeoError] = useState<string | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobilePopupPoint, setMobilePopupPoint] = useState<MapPoint | null>(null);

  const removePopupSilently = () => {
    const popup = popupRef.current;
    if (!popup) return;

    popupRef.current = null;
    popup.remove();
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateViewport);
      return () => mediaQuery.removeEventListener("change", updateViewport);
    }

    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  useEffect(() => {
    onSelectSlugRef.current = onSelectSlug;
  }, [onSelectSlug]);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  const requestGeolocation = (isManual = false) => {
    const map = mapRef.current;
    if (!map) return;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Localisation indisponible sur cet appareil.");
      return;
    }

    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        moveMap(map, {
          center: [longitude, latitude],
          zoom: 13.5,
          mode: "fly"
        });

        if (!userMarkerElementRef.current) {
          const markerElement = document.createElement("div");
          markerElement.className = "user-marker";
          userMarkerElementRef.current = markerElement;
        }

        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat([longitude, latitude]);
        } else {
          userMarkerRef.current = new mapboxgl.Marker({ element: userMarkerElementRef.current })
            .setLngLat([longitude, latitude])
            .addTo(map);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError(
            isManual
              ? "Localisation bloquée. Autorisez-la dans les paramètres du navigateur puis réessayez."
              : "Localisation refusée."
          );
          return;
        }
        if (error.code === error.TIMEOUT) {
          setGeoError("Délai de localisation dépassé.");
          return;
        }
        setGeoError("Localisation indisponible.");
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: isManual ? 0 : 60000
      }
    );
  };

  useEffect(() => {
    onGeoErrorChange?.(geoError);
  }, [geoError, onGeoErrorChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) return;

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: PARIS_CENTER,
      zoom: 11.6
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      hideNonEssentialLayers(map);
      addPractitionersSourceAndLayers(map, points);

      if (!interactionsBoundRef.current) {
        map.on("click", CLUSTERS_LAYER_ID, (event) => {
          const clusterFeature = map.queryRenderedFeatures(event.point, {
            layers: [CLUSTERS_LAYER_ID]
          })[0];

          if (!clusterFeature || !clusterFeature.properties) return;

          const clusterId = clusterFeature.properties.cluster_id as number;
          const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;

          source.getClusterExpansionZoom(clusterId, (error, zoom) => {
            if (error || typeof zoom !== "number") return;
            const coords = (clusterFeature.geometry as GeoJSON.Point).coordinates;
            moveMap(map, { center: [coords[0], coords[1]], zoom, mode: "ease" });
          });
        });

        map.on("click", UNCLUSTERED_LAYER_ID, (event) => {
          const feature = event.features?.[0];
          if (!feature || feature.geometry.type !== "Point" || !feature.properties) return;

          const slug = String(feature.properties.slug ?? "");

          onSelectSlugRef.current?.(slug);
        });

        map.on("mouseenter", CLUSTERS_LAYER_ID, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", CLUSTERS_LAYER_ID, () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("mouseenter", UNCLUSTERED_LAYER_ID, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", UNCLUSTERED_LAYER_ID, () => {
          map.getCanvas().style.cursor = "";
        });

        interactionsBoundRef.current = true;
      }

      if (!autoGeoAttemptedRef.current) {
        autoGeoAttemptedRef.current = true;

        if (typeof navigator !== "undefined" && "permissions" in navigator) {
          navigator.permissions
            .query({ name: "geolocation" })
            .then((permissionStatus) => {
              if (permissionStatus.state === "granted" || permissionStatus.state === "prompt") {
                requestGeolocation(false);
              }
            })
            .catch(() => requestGeolocation(false));
        } else {
          requestGeolocation(false);
        }
      }
    });

    mapRef.current = map;

    return () => {
      interactionsBoundRef.current = false;

      removePopupSilently();

      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      userMarkerElementRef.current = null;

      searchMarkerRef.current?.remove();
      searchMarkerRef.current = null;
      searchMarkerElementRef.current = null;

      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    source.setData(toFeatureCollection(points));
  }, [points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const previousSlug = previousSelectedSlugRef.current;
    if (previousSlug) {
      try {
        map.setFeatureState({ source: SOURCE_ID, id: previousSlug }, { selected: false });
      } catch {
        // Ignore when source is not ready.
      }
    }

    if (selectedSlug) {
      try {
        map.setFeatureState({ source: SOURCE_ID, id: selectedSlug }, { selected: true });
      } catch {
        // Ignore when source is not ready.
      }
    }

    previousSelectedSlugRef.current = selectedSlug;
  }, [selectedSlug]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selectedSlug) {
      removePopupSilently();
      setMobilePopupPoint(null);
      trackedPopupViewSlugRef.current = null;
      return;
    }

    const selectedPoint = pointsRef.current.find((p) => p.slug === selectedSlug);
    if (!selectedPoint) {
      removePopupSilently();
      setMobilePopupPoint(null);
      trackedPopupViewSlugRef.current = null;
      return;
    }

    removePopupSilently();

    if (trackedPopupViewSlugRef.current !== selectedPoint.slug) {
      trackedPopupViewSlugRef.current = selectedPoint.slug;
      trackPractitionerStat(selectedPoint.slug, "profile_view");
    }

    if (isMobileViewport) {
      setMobilePopupPoint(selectedPoint);
      return;
    }

    setMobilePopupPoint(null);

    if (selectionSource === "list") {
      moveMap(map, {
        center: [selectedPoint.lng, selectedPoint.lat],
        zoom: Math.max(map.getZoom(), 13.5),
        mode: "ease",
        padding: getPopupPadding()
      });
    }

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
      .setLngLat([selectedPoint.lng, selectedPoint.lat])
      .setHTML(buildPopupHtml(selectedPoint))
      .addTo(map);

    popupRef.current = popup;
    const popupElement = popup.getElement();
    popupElement?.querySelector(".map-popup-close")?.addEventListener("click", () => {
      onSelectSlugRef.current?.(null);
    });

    popupElement?.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trackedLink = target.closest<HTMLElement>("[data-practitioner-stat-event]");
      const statEvent = trackedLink?.dataset.practitionerStatEvent;
      const practitionerSlug = trackedLink?.dataset.practitionerSlug;

      if (
        practitionerSlug &&
        (statEvent === "contact_click" || statEvent === "booking_click")
      ) {
        trackPractitionerStat(practitionerSlug, statEvent as PractitionerStatEvent);
      }
    });
  }, [isMobileViewport, selectedSlug, selectionSource]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!searchCenter) {
      searchMarkerRef.current?.remove();
      searchMarkerRef.current = null;
      return;
    }

    removePopupSilently();
    setMobilePopupPoint(null);
    onSelectSlugRef.current?.(null);

    moveMap(map, {
      center: [searchCenter.lng, searchCenter.lat],
      zoom: 13.5,
      mode: "fly"
    });

    if (!searchMarkerElementRef.current) {
      const el = document.createElement("div");
      el.className = "search-marker";
      searchMarkerElementRef.current = el;
    }

    if (searchMarkerRef.current) {
      searchMarkerRef.current.setLngLat([searchCenter.lng, searchCenter.lat]);
    } else {
      searchMarkerRef.current = new mapboxgl.Marker({ element: searchMarkerElementRef.current })
        .setLngLat([searchCenter.lng, searchCenter.lat])
        .addTo(map);
    }
  }, [searchCenter]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeZoneCode || searchCenter || selectedSlug) return;

    fitMapToPoints(map, pointsRef.current);
  }, [activeZoneCode, points, searchCenter, selectedSlug]);

  useEffect(() => {
    if (!mapRef.current) return;

    window.requestAnimationFrame(() => {
      mapRef.current?.resize();
    });
  }, [isFullscreen]);

  useEffect(() => {
    if (locateRequestNonce <= 0) return;
    requestGeolocation(true);
  }, [locateRequestNonce]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return <div className="map-fallback">Carte indisponible: token Mapbox manquant.</div>;
  }

  return (
    <div className="map-root" aria-label="Carte des praticiens">
      <div ref={containerRef} className="map-canvas" />
      {isMobileViewport && mobilePopupPoint ? (
        <MobilePractitionerPopup
          point={mobilePopupPoint}
          onClose={() => {
            removePopupSilently();
            setMobilePopupPoint(null);
            onSelectSlugRef.current?.(null);
          }}
        />
      ) : null}
    </div>
  );
}
