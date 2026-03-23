import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const CAMPAIGN_DATE = "2026-03-23";
const BASE_DIR = path.resolve(`imports/ile-de-france/google-maps/${CAMPAIGN_DATE}`);
const SOURCE_PATH = path.join(BASE_DIR, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-with-source.json`);
const OUTPUT_PREFIX = `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-link-enrichment`;
const BOOKING_DOMAINS = [
  "calendly.com",
  "crenolib.fr",
  "doctolib.fr",
  "doctolib.com",
  "liberlo.com",
  "medoucine.com",
  "perfactive.fr",
  "resalib.fr",
  "therapeutes.com"
];
const BOOKING_HINTS = [
  "/prendre-rendez-vous",
  "/prise-de-rendez-vous",
  "/reservation",
  "/rdv",
  "/booking",
  "reserve",
  "reserver",
  "rendez-vous"
];
const WEBSITE_HEADERS = [
  "slug",
  "first_name",
  "last_name",
  "city",
  "department_code",
  "website",
  "booking_url",
  "source_google_title",
  "source_google_maps_url",
  "result",
  "error"
];

function extractHexId(placeUrl) {
  const match = (placeUrl ?? "").match(/!1s([^!]+)!8m2!3d([^!]+)!4d([^!]+)!/);
  if (!match) return "";
  return match[1];
}

function parseArgs(argv) {
  const options = {
    limit: null,
    concurrency: 3,
    headful: false,
    fresh: false,
    slugs: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--limit") {
      options.limit = Number(argv[index + 1] ?? options.limit);
      index += 1;
      continue;
    }

    if (arg === "--concurrency") {
      options.concurrency = Number(argv[index + 1] ?? options.concurrency);
      index += 1;
      continue;
    }

    if (arg === "--headful") {
      options.headful = true;
      continue;
    }

    if (arg === "--fresh") {
      options.fresh = true;
      continue;
    }

    if (arg === "--slug") {
      const slug = (argv[index + 1] ?? "").trim();
      if (slug) {
        options.slugs.push(slug);
      }
      index += 1;
    }
  }

  return options;
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeTsv(filePath, headers, rows) {
  const body = rows
    .map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return value == null ? "" : String(value).replace(/\r?\n/g, " ").trim();
        })
        .join("\t")
    )
    .join("\n");

  fs.writeFileSync(filePath, [headers.join("\t"), body].filter(Boolean).join("\n") + "\n", "utf8");
}

function loadRawHints() {
  const rawFiles = fs
    .readdirSync(BASE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("department-"))
    .map((entry) =>
      path.join(BASE_DIR, entry.name, `${OUTPUT_PREFIX.replace("-link-enrichment", "")}-${entry.name}-raw.json`)
    )
    .filter((filePath) => fs.existsSync(filePath));

  const hints = new Map();

  for (const filePath of rawFiles) {
    const rows = readJson(filePath, []);

    for (const row of rows) {
      const hexid = extractHexId(row.href);
      if (!hexid) continue;

      const text = row.text ?? "";
      hints.set(hexid, {
        source_had_site_hint: /site web/i.test(text),
        source_had_booking_hint: /r[ée]server en ligne|rendez-vous/i.test(text)
      });
    }
  }

  return hints;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeText(value) {
  return (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function isGoogleHost(hostname) {
  return (
    hostname === "google.com" ||
    hostname.endsWith(".google.com") ||
    hostname === "google.fr" ||
    hostname.endsWith(".google.fr") ||
    hostname === "maps.app.goo.gl" ||
    hostname.endsWith(".goog")
  );
}

function unwrapGoogleUrl(rawUrl) {
  let current = (rawUrl ?? "").trim();
  if (!current) return "";

  try {
    const parsed = new URL(current);
    if (isGoogleHost(parsed.hostname.toLowerCase()) && parsed.pathname === "/url") {
      const nested = parsed.searchParams.get("q") || parsed.searchParams.get("url");
      if (nested) {
        current = nested;
      }
    }
  } catch {
    return "";
  }

  try {
    const parsed = new URL(current);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function isBookingUrl(url) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const normalizedUrl = url.toLowerCase();

    return (
      BOOKING_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)) ||
      BOOKING_HINTS.some((hint) => normalizedUrl.includes(hint))
    );
  } catch {
    return false;
  }
}

function splitWebsiteAndBookingUrl(url) {
  const normalized = (url ?? "").trim();
  if (!normalized) {
    return { website: "", booking_url: "" };
  }

  return {
    website: normalized,
    booking_url: isBookingUrl(normalized) ? normalized : ""
  };
}

async function rejectConsent(page) {
  const reject = page.getByRole("button", { name: "Tout refuser" }).first();
  if (await reject.isVisible({ timeout: 3000 }).catch(() => false)) {
    await reject.click();
  }
}

async function collectAnchors(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("a[href]"))
      .map((anchor) => ({
        href: anchor.href || "",
        ariaLabel: anchor.getAttribute("aria-label") || "",
        text: (anchor.textContent || "").replace(/\s+/g, " ").trim(),
        dataItemId: anchor.getAttribute("data-item-id") || "",
        title: anchor.getAttribute("title") || ""
      }))
      .filter((item) => item.href)
  );
}

async function waitForDetailPanel(page) {
  await page.locator("h1").first().waitFor({ state: "visible", timeout: 12000 }).catch(() => null);

  await Promise.race([
    page.locator('a[data-item-id="authority"]').first().waitFor({ state: "attached", timeout: 8000 }),
    page.locator('a[aria-label*="Site Web"]').first().waitFor({ state: "attached", timeout: 8000 }),
    page.locator('a[aria-label*="Accéder au site Web"]').first().waitFor({ state: "attached", timeout: 8000 }),
    page.locator('a[href^="tel:"]').first().waitFor({ state: "attached", timeout: 8000 }),
    page.locator('a:has-text("Réserver en ligne")').first().waitFor({ state: "attached", timeout: 8000 })
  ]).catch(() => null);

  await page.waitForTimeout(1500);
}

async function extractFromPlacePage(page, row) {
  await page.goto(row.source_google_maps_url, {
    waitUntil: "domcontentloaded",
    timeout: 120000
  });
  await rejectConsent(page);
  await page.waitForURL(/google\.[^/]+\/maps/, { timeout: 120000 }).catch(() => null);
  await waitForDetailPanel(page);

  let anchors = await collectAnchors(page);
  let extracted = classifyLinks(anchors);

  if (!extracted.website && !extracted.booking_url) {
    await page.waitForTimeout(4500);
    anchors = await collectAnchors(page);
    extracted = classifyLinks(anchors);
  }

  return extracted;
}

function scoreWebsiteCandidate(anchor, url) {
  let score = 0;
  const combined = normalizeText(
    [anchor.ariaLabel, anchor.text, anchor.dataItemId, anchor.title].filter(Boolean).join(" ")
  );

  if (anchor.dataItemId === "authority") score += 10;
  if (combined.includes("site web")) score += 8;
  if (combined.includes("acceder au site web")) score += 6;
  if (combined.includes("website")) score += 6;
  if (combined.includes("reserver") || combined.includes("rendez-vous")) score -= 6;
  if (isBookingUrl(url)) score -= 3;

  return score;
}

function scoreBookingCandidate(anchor, url) {
  let score = 0;
  const combined = normalizeText(
    [anchor.ariaLabel, anchor.text, anchor.dataItemId, anchor.title, url].filter(Boolean).join(" ")
  );

  if (isBookingUrl(url)) score += 10;
  if (combined.includes("reserver")) score += 8;
  if (combined.includes("reservation")) score += 8;
  if (combined.includes("rendez-vous")) score += 8;
  if (combined.includes("prendre rendez-vous")) score += 8;
  if (combined.includes("book")) score += 4;
  if (anchor.dataItemId === "authority") score -= 4;

  return score;
}

function pickBestMatch(candidates, scoreKey) {
  if (!candidates.length) return null;

  return candidates
    .slice()
    .sort((left, right) => {
      if (right[scoreKey] !== left[scoreKey]) {
        return right[scoreKey] - left[scoreKey];
      }
      return left.url.localeCompare(right.url, "fr");
    })[0];
}

function classifyLinks(anchors) {
  const externalCandidates = [];

  for (const anchor of anchors) {
    const url = unwrapGoogleUrl(anchor.href);
    if (!url) continue;

    let hostname = "";
    try {
      hostname = new URL(url).hostname.toLowerCase();
    } catch {
      continue;
    }

    if (isGoogleHost(hostname)) continue;
    if (url.startsWith("tel:") || url.startsWith("mailto:")) continue;

    externalCandidates.push({
      url,
      websiteScore: scoreWebsiteCandidate(anchor, url),
      bookingScore: scoreBookingCandidate(anchor, url),
      ...anchor
    });
  }

  const websiteCandidate = pickBestMatch(
    externalCandidates.filter((candidate) => candidate.websiteScore > 0),
    "websiteScore"
  );
  const bookingCandidate = pickBestMatch(
    externalCandidates.filter((candidate) => candidate.bookingScore > 0),
    "bookingScore"
  );

  const websiteParts = splitWebsiteAndBookingUrl(websiteCandidate?.url ?? "");
  const bookingParts = splitWebsiteAndBookingUrl(bookingCandidate?.url ?? "");
  const website = websiteParts.website || bookingParts.website;
  const bookingUrl = bookingCandidate?.url || websiteParts.booking_url || bookingParts.booking_url;

  return {
    website,
    booking_url: bookingUrl,
    external_link_count: externalCandidates.length,
    website_candidate: websiteCandidate?.url ?? "",
    booking_candidate: bookingCandidate?.url ?? ""
  };
}

async function enrichRow(page, row) {
  if (!row.source_google_maps_url) {
    return {
      ...row,
      website: "",
      booking_url: "",
      result: "missing_source_url",
      error: "Missing source_google_maps_url"
    };
  }

  const extracted = await extractFromPlacePage(page, row);
  const result =
    extracted.website || extracted.booking_url
      ? extracted.website && extracted.booking_url
        ? "website_and_booking_found"
        : extracted.booking_url
          ? "booking_found"
          : "website_found"
      : "no_external_link_found";

  return {
    ...row,
    website: extracted.website,
    booking_url: extracted.booking_url,
    website_candidate: extracted.website_candidate,
    booking_candidate: extracted.booking_candidate,
    external_link_count: extracted.external_link_count,
    result,
    error: ""
  };
}

function shouldRetryInFreshBrowser(row, enriched) {
  return (
    (row.source_had_site_hint && !enriched.website) ||
    (row.source_had_booking_hint && !enriched.booking_url)
  );
}

async function retryInFreshBrowser(row, headful) {
  const browser = await chromium.launch({
    headless: !headful
  });
  const context = await browser.newContext({
    locale: "fr-FR"
  });
  const page = await context.newPage();

  try {
    const extracted = await extractFromPlacePage(page, row);
    const result =
      extracted.website || extracted.booking_url
        ? extracted.website && extracted.booking_url
          ? "website_and_booking_found"
          : extracted.booking_url
            ? "booking_found"
            : "website_found"
        : "no_external_link_found";

    return {
      ...row,
      website: extracted.website,
      booking_url: extracted.booking_url,
      website_candidate: extracted.website_candidate,
      booking_candidate: extracted.booking_candidate,
      external_link_count: extracted.external_link_count,
      result,
      error: "",
      retried_in_fresh_browser: true
    };
  } finally {
    await page.close().catch(() => null);
    await context.close().catch(() => null);
    await browser.close().catch(() => null);
  }
}

function escapeSqlLiteral(value) {
  return String(value).replace(/'/g, "''");
}

function buildSqlUpdates(rows) {
  const statements = rows
    .filter((row) => row.website || row.booking_url)
    .map((row) => {
      const assignments = [];

      if (row.website) {
        assignments.push(
          `website = CASE WHEN COALESCE(website, '') = '' THEN '${escapeSqlLiteral(row.website)}' ELSE website END`
        );
      }

      if (row.booking_url) {
        assignments.push(
          `booking_url = CASE WHEN COALESCE(booking_url, '') = '' THEN '${escapeSqlLiteral(row.booking_url)}' ELSE booking_url END`
        );
      }

      return `UPDATE practitioners
SET ${assignments.join(",\n    ")}
WHERE slug = '${escapeSqlLiteral(row.slug)}'
  AND (COALESCE(website, '') = '' OR COALESCE(booking_url, '') = '');`;
    });

  return statements.join("\n\n") + (statements.length ? "\n" : "");
}

function buildSummary(rows, startedAt) {
  const summary = {
    campaign_date: CAMPAIGN_DATE,
    generated_at: new Date().toISOString(),
    duration_seconds: Math.round((Date.now() - startedAt) / 1000),
    total_rows: rows.length,
    website_found_count: rows.filter((row) => row.website).length,
    booking_found_count: rows.filter((row) => row.booking_url).length,
    website_and_booking_found_count: rows.filter((row) => row.website && row.booking_url).length,
    no_external_link_found_count: rows.filter((row) => row.result === "no_external_link_found").length,
    error_count: rows.filter((row) => row.error).length
  };

  return summary;
}

function sortRows(rows) {
  return rows.slice().sort((left, right) => left.slug.localeCompare(right.slug, "fr"));
}

function buildTsvRows(rows) {
  return rows.map((row) => ({
    slug: row.slug,
    first_name: row.first_name,
    last_name: row.last_name,
    city: row.city,
    department_code: row.department_code ?? "",
    website: row.website ?? "",
    booking_url: row.booking_url ?? "",
    source_google_title: row.source_google_title ?? "",
    source_google_maps_url: row.source_google_maps_url ?? "",
    result: row.result ?? "",
    error: row.error ?? ""
  }));
}

function persistArtifacts(rows, startedAt) {
  const orderedRows = sortRows(rows);
  const jsonPath = path.join(BASE_DIR, `${OUTPUT_PREFIX}.json`);
  const tsvPath = path.join(BASE_DIR, `${OUTPUT_PREFIX}.tsv`);
  const sqlPath = path.join(BASE_DIR, `${OUTPUT_PREFIX}.sql`);
  const summaryPath = path.join(BASE_DIR, `${OUTPUT_PREFIX}-summary.json`);

  writeJson(jsonPath, orderedRows);
  writeTsv(tsvPath, WEBSITE_HEADERS, buildTsvRows(orderedRows));
  fs.writeFileSync(sqlPath, buildSqlUpdates(orderedRows), "utf8");
  writeJson(summaryPath, buildSummary(orderedRows, startedAt));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const rawHints = loadRawHints();
  const sourceRows = readJson(SOURCE_PATH, []).map((row) => ({
    ...row,
    ...(rawHints.get(row.source_google_hexid) ?? {
      source_had_site_hint: false,
      source_had_booking_hint: false
    })
  }));
  const slugFilter = new Set(options.slugs);
  const filteredRows = slugFilter.size
    ? sourceRows.filter((row) => slugFilter.has(row.slug))
    : sourceRows;
  const selectedRows =
    options.limit && Number.isFinite(options.limit) ? filteredRows.slice(0, options.limit) : filteredRows;
  const outputPath = path.join(BASE_DIR, `${OUTPUT_PREFIX}.json`);
  const existingRows = options.fresh ? [] : readJson(outputPath, []);
  const existingMap = new Map(existingRows.map((row) => [row.slug, row]));
  const pendingRows = selectedRows.filter((row) => !existingMap.has(row.slug));
  const startedAt = Date.now();

  if (!selectedRows.length) {
    throw new Error(`No rows found in ${SOURCE_PATH}`);
  }

  console.log(`Selected rows: ${selectedRows.length}`);
  console.log(`Already processed: ${existingRows.length}`);
  console.log(`Pending rows: ${pendingRows.length}`);

  const browser = await chromium.launch({
    headless: !options.headful
  });
  const context = await browser.newContext({
    locale: "fr-FR"
  });

  let cursor = 0;
  let completed = 0;
  const total = pendingRows.length;

  const worker = async (workerIndex) => {
    while (cursor < pendingRows.length) {
      const row = pendingRows[cursor];
      cursor += 1;
      const page = await context.newPage();

      try {
        let enriched = await enrichRow(page, row);

        if (shouldRetryInFreshBrowser(row, enriched)) {
          enriched = await retryInFreshBrowser(row, options.headful);
        }

        existingMap.set(row.slug, enriched);
        completed += 1;

        console.log(
          `[${completed}/${total}] worker=${workerIndex} ${row.slug} website=${Boolean(enriched.website)} booking=${Boolean(enriched.booking_url)} result=${enriched.result}${enriched.retried_in_fresh_browser ? " retry=fresh" : ""}`
        );
      } catch (error) {
        const failed = {
          ...row,
          website: "",
          booking_url: "",
          result: "error",
          error: error instanceof Error ? error.message : String(error)
        };
        existingMap.set(row.slug, failed);
        completed += 1;

        console.log(`[${completed}/${total}] worker=${workerIndex} ${row.slug} error=${failed.error}`);
      } finally {
        persistArtifacts(Array.from(existingMap.values()), startedAt);
        await page.close().catch(() => null);
        await sleep(300 + Math.floor(Math.random() * 500));
      }
    }
  };

  const workers = Array.from({ length: Math.max(1, options.concurrency) }, (_, index) => worker(index + 1));
  await Promise.all(workers);
  await context.close();
  await browser.close();

  const finalRows = Array.from(existingMap.values()).filter((row) =>
    selectedRows.some((selectedRow) => selectedRow.slug === row.slug)
  );
  persistArtifacts(finalRows, startedAt);

  const summary = buildSummary(finalRows, startedAt);
  console.log(`Website found: ${summary.website_found_count}`);
  console.log(`Booking found: ${summary.booking_found_count}`);
  console.log(`Errors: ${summary.error_count}`);
  console.log(`Output prefix: ${path.join(BASE_DIR, OUTPUT_PREFIX)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
