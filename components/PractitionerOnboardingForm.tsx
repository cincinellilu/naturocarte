"use client";

import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 300;
const DEFAULT_PROXIMITY = { lng: 2.3522, lat: 48.8566 };

type AddressSuggestion = {
  id: string;
  label: string;
  addressLine: string;
  postalCode: string;
  city: string;
};

type MapboxFeature = {
  id?: string;
  geometry?: { coordinates?: [number, number] };
  properties?: {
    full_address?: string;
    name?: string;
    address?: string;
    context?: {
      postcode?: { name?: string };
      place?: { name?: string };
      locality?: { name?: string };
      address?: { name?: string; address_number?: string; street_name?: string };
      street?: { name?: string };
    };
  };
  place_name?: string;
  name?: string;
};

function buildAddressLine(feature: MapboxFeature, fallback: string): string {
  const address = feature.properties?.context?.address;
  const addressNumber = address?.address_number?.trim();
  const streetName = address?.street_name?.trim() || feature.properties?.context?.street?.name?.trim();

  if (addressNumber && streetName) return `${addressNumber} ${streetName}`;
  return feature.properties?.address?.trim() || address?.name?.trim() || feature.properties?.name?.trim() || fallback;
}

function featureToSuggestion(feature: MapboxFeature, fallback: string): AddressSuggestion | null {
  const coords = feature.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;

  const postalCode = feature.properties?.context?.postcode?.name?.trim() ?? "";
  const city =
    feature.properties?.context?.place?.name?.trim() ??
    feature.properties?.context?.locality?.name?.trim() ??
    "";

  return {
    id: feature.id ?? `${coords[0]}-${coords[1]}`,
    label: feature.properties?.full_address ?? feature.place_name ?? feature.properties?.name ?? fallback,
    addressLine: buildAddressLine(feature, fallback),
    postalCode,
    city
  };
}

export default function PractitionerOnboardingForm({
  accountId = null
}: {
  accountId?: string | null;
}) {
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const query = [addressLine, postalCode, city].map((value) => value.trim()).filter(Boolean).join(", ");

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

        const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`, {
          method: "GET",
          signal: controller.signal
        });

        if (!response.ok) throw new Error("Mapbox geocoding failed");

        const payload = (await response.json()) as { features?: MapboxFeature[] };
        const nextSuggestions = (payload.features ?? [])
          .map((feature) => featureToSuggestion(feature, query))
          .filter((suggestion): suggestion is AddressSuggestion => Boolean(suggestion))
          .slice(0, 5);

        setSuggestions(nextSuggestions);
        setIsSuggestionsOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [addressLine, postalCode, city]);

  function selectSuggestion(suggestion: AddressSuggestion) {
    setAddressLine(suggestion.addressLine);
    if (suggestion.postalCode) setPostalCode(suggestion.postalCode);
    if (suggestion.city) setCity(suggestion.city);
    setIsSuggestionsOpen(false);
  }

  return (
    <form
      className="dashboard-onboarding-form"
      action="/api/practitioner-dashboard/onboarding"
      method="post"
    >
      {accountId ? <input type="hidden" name="account_id" value={accountId} /> : null}
      <div className="practitioner-identity-row">
        <input
          name="first_name"
          type="text"
          required
          autoComplete="given-name"
          className="practitioner-form-input"
          placeholder="Prénom"
        />
        <input
          name="last_name"
          type="text"
          required
          autoComplete="family-name"
          className="practitioner-form-input"
          placeholder="Nom"
        />
        <input
          name="siret"
          type="text"
          required
          inputMode="numeric"
          pattern="[0-9 ]{14,20}"
          className="practitioner-form-input"
          placeholder="SIRET"
        />
      </div>

      <div className="dashboard-address-grid">
        <div className="dashboard-address-autocomplete">
          <input
            name="address_line"
            type="text"
            required
            autoComplete="street-address"
            className="practitioner-form-input"
            placeholder="N° et nom de la voie"
            value={addressLine}
            onChange={(event) => {
              setAddressLine(event.target.value);
              setIsSuggestionsOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setIsSuggestionsOpen(true);
            }}
          />
          {isSuggestionsOpen && (isLoadingSuggestions || suggestions.length > 0) ? (
            <div className="dashboard-address-suggestions">
              {isLoadingSuggestions ? <p>Recherche d’adresse...</p> : null}
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  className="dashboard-address-suggestion"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <input
          name="postal_code"
          type="text"
          required
          inputMode="numeric"
          pattern="[0-9]{5}"
          autoComplete="postal-code"
          className="practitioner-form-input"
          placeholder="Code postal"
          value={postalCode}
          onChange={(event) => setPostalCode(event.target.value)}
        />
        <input
          name="city"
          type="text"
          required
          autoComplete="address-level2"
          className="practitioner-form-input"
          placeholder="Ville"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
      </div>

      <p className="dashboard-help">
        L’adresse permet de positionner votre fiche sur la carte. Sélectionnez une suggestion si elle apparaît,
        sinon renseignez l’adresse complète manuellement.
      </p>
      <button className="btn dashboard-save-btn" type="submit">
        Créer ma fiche praticien
      </button>
    </form>
  );
}
