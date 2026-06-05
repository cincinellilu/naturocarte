import { NextResponse } from "next/server";

type GeocodeResult = {
  id: string;
  label: string;
  lng: number;
  lat: number;
};

function normalizeQuery(value: string | null): string {
  return (value ?? "")
    .trim()
    .replace(/[;]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 256);
}

function normalizeLimit(value: string | null, fallback: number, max: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = normalizeQuery(url.searchParams.get("q"));
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim();

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (!token) {
    return NextResponse.json({ results: [] }, { status: 503 });
  }

  const limit = normalizeLimit(url.searchParams.get("limit"), 5, 10);
  const params = new URLSearchParams({
    q: query,
    access_token: token,
    country: "fr",
    limit: String(limit),
    language: "fr",
    autocomplete: "true",
    proximity: "2.3522,48.8566"
  });

  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    return NextResponse.json({ results: [] }, { status: response.status });
  }

  const payload = (await response.json()) as {
    features?: Array<{
      id?: string;
      geometry?: { coordinates?: [number, number] };
      properties?: { full_address?: string; name?: string };
      place_name?: string;
      name?: string;
    }>;
  };

  const results: GeocodeResult[] = (payload.features ?? [])
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
    .filter((result): result is GeocodeResult => Boolean(result));

  return NextResponse.json({ results });
}
