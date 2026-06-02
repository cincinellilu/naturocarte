"use client";

import { useEffect, useState } from "react";
import CarteInteractive, { type CarteInteractiveProps } from "@/components/CarteInteractive";

function CarteInteractiveFallback() {
  return (
    <div className="map-experience">
      <div className="map-fallback map-fallback--loading">
        Carte interactive en cours de chargement…
      </div>
    </div>
  );
}

export default function CarteInteractiveMount(props: CarteInteractiveProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <CarteInteractiveFallback />;
  }

  return <CarteInteractive {...props} />;
}
