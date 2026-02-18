"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

export default function PractitionerDetailMap({
  lat,
  lng
}: {
  lat: number;
  lng: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom: 13.5
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      const markerElement = document.createElement("div");
      markerElement.className = "search-marker";

      markerRef.current = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([lng, lat])
        .addTo(map);

      map.resize();
      map.setCenter([lng, lat]);
    });

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef.current);

    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13.5), duration: 450 });

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [lat, lng]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return <p>Carte indisponible.</p>;
  }

  return <div ref={containerRef} className="mini-map-canvas" aria-label="Carte du praticien" />;
}
