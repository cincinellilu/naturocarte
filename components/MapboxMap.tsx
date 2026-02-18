"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

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
};

type SelectionSource = "map" | "list" | null;
type SearchCenter = { lng: number; lat: number } | null;

function shouldReduceMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function moveMap(
  map: mapboxgl.Map,
  options: { center: [number, number]; zoom?: number; mode?: "fly" | "ease" }
) {
  const reduceMotion = shouldReduceMotion();

  if (reduceMotion) {
    map.jumpTo({ center: options.center, zoom: options.zoom });
    return;
  }

  if (options.mode === "fly") {
    map.flyTo({ center: options.center, zoom: options.zoom, speed: 1.2 });
    return;
  }

  map.easeTo({ center: options.center, zoom: options.zoom, duration: 550 });
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

function buildPopupHtml(point: MapPoint): string {
  const bookingUrl =
    typeof point.booking_url === "string" &&
    (point.booking_url.startsWith("http://") || point.booking_url.startsWith("https://"))
      ? point.booking_url
      : null;

  const phoneLine = point.phone
    ? `<p><strong>Tél :</strong> ${escapeHtml(point.phone)}</p>`
    : "";
  const emailLine = point.email
    ? `<p><strong>Email :</strong> <a href="mailto:${encodeURIComponent(point.email)}">${escapeHtml(point.email)}</a></p>`
    : "";
  const bookingLine = bookingUrl
    ? `<p><strong>Booking :</strong> <a href="${escapeHtml(
        bookingUrl
      )}" target="_blank" rel="noopener noreferrer">Prendre rendez-vous</a></p>`
    : "";

  return `<div class="map-popup">
    <p class="map-popup-name">${escapeHtml(point.first_name)} ${escapeHtml(point.last_name)}</p>
    ${phoneLine}
    ${emailLine}
    ${bookingLine}
    <a class="map-popup-link" href="/naturopathe/${encodeURIComponent(point.slug)}">Voir la fiche</a>
  </div>`;
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
        "circle-color": "#1f2937",
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
          "#115e59",
          "#0f766e"
        ],
        "circle-radius": ["case", ["boolean", ["feature-state", "selected"], false], 10, 8],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff"
      }
    });
  }
}

export default function MapboxMap({
  points,
  selectedSlug = null,
  selectionSource = null,
  onSelectSlug,
  searchCenter = null,
  onReady
}: {
  points: MapPoint[];
  selectedSlug?: string | null;
  selectionSource?: SelectionSource;
  onSelectSlug?: (slug: string) => void;
  searchCenter?: SearchCenter;
  onReady?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const interactionsBoundRef = useRef(false);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const previousSelectedSlugRef = useRef<string | null>(null);
  const onSelectSlugRef = useRef<typeof onSelectSlug>(onSelectSlug);
  const pointsRef = useRef<MapPoint[]>(points);
  const onReadyRef = useRef<typeof onReady>(onReady);

  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerElementRef = useRef<HTMLDivElement | null>(null);
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const searchMarkerElementRef = useRef<HTMLDivElement | null>(null);
  const autoGeoAttemptedRef = useRef(false);

  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    onSelectSlugRef.current = onSelectSlug;
  }, [onSelectSlug]);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

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
      onReadyRef.current?.();

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

          const coordinates = [...feature.geometry.coordinates] as [number, number];
          const slug = String(feature.properties.slug ?? "");
          const firstName = String(feature.properties.first_name ?? "");
          const lastName = String(feature.properties.last_name ?? "");

          const selectedPoint =
            pointsRef.current.find((p) => p.slug === slug) ?? {
              slug,
              first_name: firstName,
              last_name: lastName,
              lat: coordinates[1],
              lng: coordinates[0]
            };

          popupRef.current?.remove();
          popupRef.current = new mapboxgl.Popup({ closeButton: true, closeOnClick: true })
            .setLngLat(coordinates)
            .setHTML(buildPopupHtml(selectedPoint))
            .addTo(map);

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

      popupRef.current?.remove();
      popupRef.current = null;

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
    if (!map || selectionSource !== "list" || !selectedSlug) return;

    const selectedPoint = pointsRef.current.find((p) => p.slug === selectedSlug);
    if (!selectedPoint) return;

    moveMap(map, {
      center: [selectedPoint.lng, selectedPoint.lat],
      zoom: Math.max(map.getZoom(), 13.5),
      mode: "ease"
    });

    popupRef.current?.remove();
    popupRef.current = new mapboxgl.Popup({ closeButton: true, closeOnClick: true })
      .setLngLat([selectedPoint.lng, selectedPoint.lat])
      .setHTML(buildPopupHtml(selectedPoint))
      .addTo(map);
  }, [selectedSlug, selectionSource]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!searchCenter) {
      searchMarkerRef.current?.remove();
      searchMarkerRef.current = null;
      return;
    }

    popupRef.current?.remove();
    popupRef.current = null;

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

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return <div className="map-fallback">Carte indisponible: token Mapbox manquant.</div>;
  }

  return (
    <div className="map-root" aria-label="Carte des praticiens">
      <div ref={containerRef} className="map-canvas" />
      <div className="map-overlay">
        <button type="button" className="map-locate-btn" onClick={() => requestGeolocation(true)}>
          Me localiser
        </button>
        {geoError ? <p className="map-overlay-error">{geoError}</p> : null}
      </div>
    </div>
  );
}
