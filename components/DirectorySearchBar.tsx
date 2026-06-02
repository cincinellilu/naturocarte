"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { trackProductEvent } from "@/lib/product-events";

type PractitionerEntry = {
  slug: string;
  first_name: string;
  last_name: string;
};

type SearchResult = {
  label: string;
  href: string;
  keywords: string;
};

type DirectorySearchBarProps = {
  practitioners: PractitionerEntry[];
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

function getQueryScore(query: string, keywords: string): number {
  if (!query) return 0;
  if (keywords === query) return 120;
  if (keywords.startsWith(query)) return 90;
  if (keywords.includes(query)) return 60;
  return 0;
}

export default function DirectorySearchBar({
  practitioners,
  compact = false
}: DirectorySearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const normalizedQuery = useMemo(() => normalizeSearchValue(query), [query]);

  const results = useMemo(() => {
    return practitioners
      .map((practitioner) => {
        const firstName = practitioner.first_name.trim();
        const lastName = practitioner.last_name.trim();
        const fullName = `${firstName} ${lastName}`.trim();

        return {
          label: fullName,
          href: `/naturopathe/${practitioner.slug}`,
          keywords: normalizeSearchValue([fullName, firstName, lastName].join(" "))
        };
      })
      .map((item) => ({ ...item, score: getQueryScore(normalizedQuery, item.keywords) }))
      .filter((item) => item.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return left.label.localeCompare(right.label, "fr", { sensitivity: "base" });
      })
      .slice(0, 6);
  }, [normalizedQuery, practitioners]);

  function openBestResult() {
    trackProductEvent(
      results.length === 0 ? "directory_search_no_result" : "directory_search_submitted",
      {
        query_length: query.trim().length,
        results_count: results.length,
        top_result: results[0]?.href ?? null
      }
    );
    if (results.length === 0) return;
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
        <button type="submit" className="btn directory-search-submit" disabled={results.length === 0}>
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
          {results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.href}
                type="button"
                className="directory-search-result"
                onClick={() => {
                  trackProductEvent("directory_search_result_clicked", {
                    query_length: query.trim().length,
                    result_href: result.href
                  });
                  router.push(result.href);
                }}
              >
                <span className="directory-search-result-label">{result.label}</span>
                <span className="directory-search-result-helper">Praticien · Ouvrir la fiche</span>
              </button>
            ))
          ) : (
            <p className="directory-search-empty">
              Aucun résultat direct. Essayez un nom de praticien.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
