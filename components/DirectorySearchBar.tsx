"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PartnerBadge from "@/components/PartnerBadge";
import { rememberPractitionerEntrySource } from "@/lib/practitioner-entry-source";
import { trackProductEvent } from "@/lib/product-events";

type SearchResult = {
  label: string;
  href: string;
  is_partner?: boolean;
};

type DirectorySearchBarProps = {
  compact?: boolean;
};

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getPractitionerSlugFromHref(href: string): string | null {
  const match = href.match(/^\/naturopathe\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export default function DirectorySearchBar({
  compact = false
}: DirectorySearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const normalizedQuery = useMemo(() => normalizeSearchValue(query), [query]);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsLoading(true);

      fetch(`/api/practitioner-search?q=${encodeURIComponent(query.trim())}`, {
        signal: controller.signal
      })
        .then((response) => (response.ok ? response.json() : { results: [] }))
        .then((data: { results?: SearchResult[] }) => {
          setResults(data.results ?? []);
        })
        .catch((error) => {
          if (error?.name !== "AbortError") setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    }, 220);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [normalizedQuery, query]);

  function openBestResult() {
    const practitionerSlug = results[0]?.href ? getPractitionerSlugFromHref(results[0].href) : null;
    trackProductEvent(
      results.length === 0 ? "directory_search_no_result" : "directory_search_submitted",
      {
        query_length: query.trim().length,
        results_count: results.length,
        top_result: results[0]?.href ?? null,
        practitioner_slug: practitionerSlug
      }
    );
    if (results.length === 0) return;
    if (practitionerSlug) {
      rememberPractitionerEntrySource(practitionerSlug, "directory_search");
    }
    router.push(results[0].href);
  }

  return (
    <div className="directory-search-bar">
      <form
        className="directory-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          openBestResult();
        }}
      >
        <input
          id="directory-search"
          type="search"
          className="search-input directory-search-input"
          placeholder="Rechercher un naturopathe"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn directory-search-submit"
          disabled={results.length === 0 || isLoading}
        >
          Rechercher
        </button>
      </form>

      {compact ? null : (
        <div className="directory-search-hint">
          Tapez le nom d’un naturopathe pour ouvrir sa fiche directement.
        </div>
      )}

      {query.trim() ? (
        <div className="directory-search-results" role="listbox" aria-label="Suggestions de recherche">
          {isLoading ? (
            <p className="directory-search-empty">Recherche en cours...</p>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.href}
                type="button"
                className="directory-search-result"
                onClick={() => {
                  const practitionerSlug = getPractitionerSlugFromHref(result.href);
                  if (practitionerSlug) {
                    rememberPractitionerEntrySource(practitionerSlug, "directory_search");
                  }
                  trackProductEvent("directory_search_result_clicked", {
                    query_length: query.trim().length,
                    result_href: result.href,
                    practitioner_slug: practitionerSlug
                  });
                  router.push(result.href);
                }}
              >
                <span className="directory-search-result-label">{result.label}</span>
                {result.is_partner ? <PartnerBadge className="partner-badge--inline" /> : null}
                <span className="directory-search-result-helper">Praticien · Ouvrir la fiche</span>
              </button>
            ))
          ) : normalizedQuery.length >= 2 ? (
            <p className="directory-search-empty">
              Aucun résultat direct. Essayez un nom de praticien.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
