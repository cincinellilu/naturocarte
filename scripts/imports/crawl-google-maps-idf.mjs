import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const CAMPAIGN_DATE = "2026-03-23";
const SEARCH_PLAN_PATH = path.resolve(
  `imports/ile-de-france/google-maps/${CAMPAIGN_DATE}/idf-search-plan.tsv`
);
const DEFAULT_ENV = path.resolve(".env.local");

function parseArgs(argv) {
  const options = {
    department: "92",
    maxQueries: null,
    maxDetails: null,
    headful: false,
    detailConcurrency: 4,
    minQueries: 0,
    staleQueryLimit: null,
    staleRelevantThreshold: 0
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--department") {
      options.department = argv[i + 1] ?? options.department;
      i += 1;
      continue;
    }

    if (arg === "--max-queries") {
      options.maxQueries = Number(argv[i + 1] ?? options.maxQueries);
      i += 1;
      continue;
    }

    if (arg === "--max-details") {
      options.maxDetails = Number(argv[i + 1] ?? options.maxDetails);
      i += 1;
      continue;
    }

    if (arg === "--headful") {
      options.headful = true;
      continue;
    }

    if (arg === "--detail-concurrency") {
      options.detailConcurrency = Number(argv[i + 1] ?? options.detailConcurrency);
      i += 1;
      continue;
    }

    if (arg === "--min-queries") {
      options.minQueries = Number(argv[i + 1] ?? options.minQueries);
      i += 1;
      continue;
    }

    if (arg === "--stale-query-limit") {
      options.staleQueryLimit = Number(argv[i + 1] ?? options.staleQueryLimit);
      i += 1;
      continue;
    }

    if (arg === "--stale-relevant-threshold") {
      options.staleRelevantThreshold = Number(argv[i + 1] ?? options.staleRelevantThreshold);
      i += 1;
    }
  }

  return options;
}

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    process.env[key] = value;
  }
}

function readTsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").trim();
  const [headerLine, ...lines] = raw.split(/\r?\n/);
  const headers = headerLine.split("\t");

  return lines.map((line) => {
    const columns = line.split("\t");
    return Object.fromEntries(headers.map((header, index) => [header, columns[index] ?? ""]));
  });
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

  const content = [headers.join("\t"), body].filter(Boolean).join("\n") + "\n";
  fs.writeFileSync(filePath, content, "utf8");
}

function slugify(value) {
  return (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function normalizeText(value) {
  return (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function formatFirstName(value) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .split(/([-'’\s])/)
    .map((chunk) =>
      /^[\p{L}]/u.test(chunk) ? chunk.charAt(0).toUpperCase() + chunk.slice(1) : chunk
    )
    .join("");
}

function buildIdentityKey(row) {
  return [
    normalizeText(row.first_name),
    normalizeText(row.last_name),
    normalizeText(row.adresse),
    normalizeText(row.postal_code),
    normalizeText(row.city)
  ].join("|");
}

function extractHexId(placeUrl) {
  const match = placeUrl.match(/!1s([^!]+)!8m2!3d([^!]+)!4d([^!]+)!/);
  if (!match) {
    return {
      hexid: "",
      lat: "",
      lng: ""
    };
  }

  return {
    hexid: match[1],
    lat: match[2],
    lng: match[3]
  };
}

function parseAddress(addressLabel) {
  const raw = (addressLabel ?? "")
    .replace(/^Adresse:\s*/i, "")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim();
  const match = raw.match(/^(.*?)(?:,\s*)?(\d{5})\s+(.+)$/);

  if (!match) {
    return {
      adresse: raw,
      postal_code: "",
      city: ""
    };
  }

  return {
    adresse: match[1].trim(),
    postal_code: match[2].trim(),
    city: match[3].trim()
  };
}

function parseName(title, knownFirstNames = new Set()) {
  const normalized = (title ?? "")
    .replace(/Sponsorisé/gi, " ")
    .replace(/[|｜]/g, " - ")
    .replace(/["“”][^"“”]*["“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const stopKeywords = [
    "naturopathe",
    "naturopathie",
    "réflexologue",
    "reflexologue",
    "nutritionniste",
    "praticien",
    "praticienne",
    "massage",
    "massages",
    "cabinet",
    "centre",
    "maison",
    "studio",
    "formation",
    "consultation",
    "thérapeute",
    "therapeute"
  ];

  const segments = normalized
    .split(" - ")
    .map((segment) => segment.replace(/["“”]/g, "").trim())
    .filter(Boolean);

  const blockedPrefixes = ["cabinet", "centre", "formation", "studio", "maison", "prisma"];
  let bestCandidate = null;

  for (const segment of segments) {
    if (/[&/]/.test(segment)) {
      continue;
    }

    const tokens = segment
      .split(/\s+/)
      .map((token) => token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}'’-]+$/gu, ""))
      .filter(Boolean);
    const kept = [];

    for (const token of tokens) {
      const lower = normalizeText(token);
      if (stopKeywords.includes(lower)) break;
      kept.push(token);
    }

    if (kept.length < 2) {
      continue;
    }

    let firstName = kept[0];
    let lastName = kept.slice(1).join(" ");

    if (
      kept.length === 2 &&
      knownFirstNames.has(normalizeText(kept[1])) &&
      !knownFirstNames.has(normalizeText(kept[0]))
    ) {
      firstName = kept[1];
      lastName = kept[0];
    }

    if (blockedPrefixes.includes(normalizeText(firstName))) {
      continue;
    }

    if (stopKeywords.includes(normalizeText(lastName))) {
      continue;
    }

    let score = 0;
    if (knownFirstNames.has(normalizeText(firstName))) score += 10;
    if (knownFirstNames.has(normalizeText(kept[kept.length - 1]))) score -= 3;
    if (kept.length === 2) score += 4;
    if (kept.length === 3) score += 2;
    if (kept.length === 4) score += 1;

    const candidate = {
      first_name: formatFirstName(firstName),
      last_name: lastName.toUpperCase(),
      score
    };

    if (!bestCandidate || candidate.score > bestCandidate.score) {
      bestCandidate = candidate;
    }
  }

  if (!bestCandidate) {
    return null;
  }

  return {
    first_name: bestCandidate.first_name,
    last_name: bestCandidate.last_name
  };
}

function splitWebsiteAndBookingUrl(url) {
  const normalized = (url ?? "").trim();
  if (!normalized) {
    return { website: "", booking_url: "" };
  }

  let hostname = "";
  try {
    hostname = new URL(normalized).hostname.toLowerCase();
  } catch {
    return { website: normalized, booking_url: "" };
  }

  const bookingDomains = [
    "calendly.com",
    "crenolib.fr",
    "doctolib.fr",
    "doctolib.com",
    "liberlo.com",
    "medoucine.com",
    "resalib.fr"
  ];
  const bookingHints = ["/prendre-rendez-vous", "/prise-de-rendez-vous", "/booking", "/reservation"];
  const isBookingUrl =
    bookingDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`)) ||
    bookingHints.some((hint) => normalized.toLowerCase().includes(hint));

  return {
    website: normalized,
    booking_url: isBookingUrl ? normalized : ""
  };
}

async function fetchLivePractitioners() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { data, error } = await supabase
    .from("practitioners")
    .select("slug, first_name, last_name, adresse, postal_code, city")
    .order("slug", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function rejectConsent(page) {
  const reject = page.getByRole("button", { name: "Tout refuser" }).first();
  if (await reject.isVisible({ timeout: 3000 }).catch(() => false)) {
    await reject.click();
  }
}

async function collectSearchResults(page, searchUrl) {
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
  await rejectConsent(page);
  await page.waitForURL(/google\.com\/maps/, { timeout: 120000 });
  await Promise.race([
    page.locator("div.Nv2PK").first().waitFor({ state: "visible", timeout: 6000 }),
    page.locator('div[role="feed"]').first().waitFor({ state: "visible", timeout: 6000 })
  ]).catch(() => null);
  await page.waitForTimeout(1200);

  const feed = page.locator('div[role="feed"]').first();
  if ((await feed.count()) > 0) {
    let previousCount = 0;
    let stablePasses = 0;

    while (stablePasses < 2) {
      const currentCount = await page.locator("div.Nv2PK").count();
      if (currentCount === previousCount) {
        stablePasses += 1;
      } else {
        stablePasses = 0;
        previousCount = currentCount;
      }

      await feed.evaluate((el) => {
        el.scrollBy(0, el.scrollHeight);
      });
      await page.waitForTimeout(800);
    }
  }

  return page.locator("div.Nv2PK").evaluateAll((cards) =>
    cards.map((card) => {
      const link = card.querySelector('a.hfpxzc[href*="/maps/place/"]');
      return {
        title: link?.getAttribute("aria-label") ?? "",
        href: link?.href ?? "",
        text: (card.textContent || "").replace(/\s+/g, " ").trim()
      };
    })
  );
}

async function collectPlaceDetails(page, placeUrl) {
  await page.goto(placeUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForURL(/google\.com\/maps/, { timeout: 120000 });
  await Promise.race([
    page.locator("h1").first().waitFor({ state: "visible", timeout: 6000 }),
    page.locator('button[aria-label^="Adresse:"]').first().waitFor({ state: "visible", timeout: 6000 })
  ]).catch(() => null);
  await page.waitForTimeout(1200);

  const title = (
    (await page.locator("h1").first().textContent().catch(() => "")) ||
    (await page.getByRole("button", { name: /.+/ }).nth(0).textContent().catch(() => ""))
  )
    .replace(/\s+/g, " ")
    .trim();

  const websiteLink =
    (await page.locator('a[aria-label^="Site Web:"]').first().getAttribute("href").catch(() => null)) ||
    (await page.locator('a[aria-label="Accéder au site Web"]').first().getAttribute("href").catch(() => null)) ||
    "";

  const phoneHref = await page.locator('a[href^="tel:"]').first().getAttribute("href").catch(() => null);
  const phoneButtonText = (
    (await page.locator('button[aria-label^="Numéro de téléphone:"]').first().textContent().catch(() => "")) ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();

  const addressButtonText = (
    (await page.locator('button[aria-label^="Adresse:"]').first().textContent().catch(() => "")) ||
    ""
  )
    .replace(/\s+/g, " ")
    .trim();

  const category = (
    (await page.locator("button.DkEaL").first().textContent().catch(() => "")) ||
    (await page.locator("button").evaluateAll((buttons) => {
      const match = buttons.find((button) => /naturopathe/i.test(button.textContent || ""));
      return match?.textContent || "";
    }).catch(() => ""))
  )
    .replace(/\s+/g, " ")
    .trim();

  return {
    title,
    website: websiteLink,
    phone: phoneHref ? phoneHref.replace(/^tel:/, "").trim() : phoneButtonText.replace(/[^\d+]/g, ""),
    addressLabel: addressButtonText,
    category
  };
}

function toPractitionerRow(detail, placeUrl, departmentCode, knownFirstNames) {
  const parsedName = parseName(detail.title, knownFirstNames);
  if (!parsedName) return null;

  const address = parseAddress(detail.addressLabel);
  if (!address.postal_code || !address.city) return null;
  if (normalizeText(address.city) === "paris" || address.postal_code.startsWith("75")) return null;
  if (!/^(77|78|91|92|93|94|95)/.test(address.postal_code)) return null;
  if (!address.postal_code.startsWith(departmentCode)) return null;
  if (!/naturopathe/i.test(`${detail.category} ${detail.title}`)) return null;

  const mapMeta = extractHexId(placeUrl);
  const slug = [parsedName.first_name, parsedName.last_name, address.city]
    .map(slugify)
    .filter(Boolean)
    .join("-");
  const links = splitWebsiteAndBookingUrl(detail.website);

  return {
    first_name: parsedName.first_name,
    last_name: parsedName.last_name,
    slug,
    adresse: address.adresse,
    postal_code: address.postal_code,
    city: address.city,
    lat: mapMeta.lat,
    lng: mapMeta.lng,
    phone: detail.phone,
    email: "",
    website: links.website,
    booking_url: links.booking_url,
    description: "",
    status: `gmaps_idf_${CAMPAIGN_DATE.replace(/-/g, "")}_${departmentCode}`,
    source_google_hexid: mapMeta.hexid,
    source_google_maps_url: placeUrl,
    source_google_title: detail.title,
    source_google_category: detail.category
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  loadEnv(DEFAULT_ENV);

  const searchPlan = readTsv(SEARCH_PLAN_PATH)
    .filter((row) => row.department_code === options.department)
    .sort((a, b) => Number(a.priority_in_department) - Number(b.priority_in_department));

  const selectedQueries =
    options.maxQueries && Number.isFinite(options.maxQueries)
      ? searchPlan.slice(0, options.maxQueries)
      : searchPlan;

  const outputDir = path.resolve(
    `imports/ile-de-france/google-maps/${CAMPAIGN_DATE}/department-${options.department}`
  );
  fs.mkdirSync(outputDir, { recursive: true });

  const liveRows = await fetchLivePractitioners();
  const liveSlugSet = new Set(liveRows.map((row) => row.slug));
  const liveIdentitySet = new Set(liveRows.map(buildIdentityKey));
  const knownFirstNames = new Set(
    liveRows.map((row) => normalizeText(row.first_name)).filter(Boolean).concat([
      "patricia",
      "alexandra",
      "fanny",
      "marie-alix",
      "eulalie",
      "eleana"
    ])
  );

  const browser = await chromium.launch({ headless: !options.headful });
  const context = await browser.newContext({ locale: "fr-FR" });
  const listPage = await context.newPage();
  const detailConcurrency =
    Number.isFinite(options.detailConcurrency) && options.detailConcurrency > 0
      ? Math.min(Math.floor(options.detailConcurrency), 8)
      : 4;

  const uniquePlaces = new Map();
  const searchAudit = [];
  let staleQueryCount = 0;

  for (const row of selectedQueries) {
    console.log(`Searching ${row.commune_name} (${row.department_code})`);
    const cards = await collectSearchResults(listPage, row.google_maps_search_url);
    let newUniquePlaces = 0;
    let newRelevantPlaces = 0;

    for (const card of cards) {
      if (!card.href || !card.title) continue;
      if (!uniquePlaces.has(card.href)) {
        const isRelevant = /naturop|naturo/i.test(`${card.title} ${card.text}`);
        uniquePlaces.set(card.href, {
          ...card,
          commune_name: row.commune_name,
          department_code: row.department_code,
          department_name: row.department_name,
          query: row.google_maps_query,
          is_relevant_candidate: isRelevant
        });
        newUniquePlaces += 1;
        if (isRelevant) {
          newRelevantPlaces += 1;
        }
      }
    }

    if (Number.isFinite(options.staleQueryLimit) && options.staleQueryLimit > 0) {
      if (newRelevantPlaces <= options.staleRelevantThreshold) {
        staleQueryCount += 1;
      } else {
        staleQueryCount = 0;
      }
    }

    searchAudit.push({
      department_code: row.department_code,
      commune_name: row.commune_name,
      priority_in_department: row.priority_in_department,
      new_unique_places: newUniquePlaces,
      new_relevant_places: newRelevantPlaces,
      total_unique_places: uniquePlaces.size,
      stale_query_count: staleQueryCount
    });

    if (
      Number.isFinite(options.staleQueryLimit) &&
      options.staleQueryLimit > 0 &&
      searchAudit.length >= options.minQueries &&
      staleQueryCount >= options.staleQueryLimit
    ) {
      console.log(
        `Stopping search after saturation: ${staleQueryCount} stale queries (threshold ${options.staleRelevantThreshold})`
      );
      break;
    }
  }

  const placeEntries = [...uniquePlaces.values()];
  const likelyRelevantPlaces = placeEntries.filter((place) => place.is_relevant_candidate);
  const selectedDetails =
    options.maxDetails && Number.isFinite(options.maxDetails)
      ? likelyRelevantPlaces.slice(0, options.maxDetails)
      : likelyRelevantPlaces;

  const rawDetails = new Array(selectedDetails.length);
  const candidateRows = new Array(selectedDetails.length);
  const detailPages = await Promise.all(
    Array.from({ length: Math.min(detailConcurrency, Math.max(selectedDetails.length, 1)) }, () =>
      context.newPage()
    )
  );
  let nextIndex = 0;

  async function runDetailWorker(page) {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= selectedDetails.length) {
        return;
      }

      const place = selectedDetails[currentIndex];
      console.log(`Detail ${currentIndex + 1}/${selectedDetails.length} ${place.title}`);

      try {
        const detail = await collectPlaceDetails(page, place.href);
        rawDetails[currentIndex] = {
          ...place,
          detail
        };
        candidateRows[currentIndex] = toPractitionerRow(
          detail,
          place.href,
          options.department,
          knownFirstNames
        );
      } catch (error) {
        rawDetails[currentIndex] = {
          ...place,
          detail: {
            title: "",
            website: "",
            phone: "",
            addressLabel: "",
            category: "",
            error: error instanceof Error ? error.message : String(error)
          }
        };
        candidateRows[currentIndex] = null;
      }
    }
  }

  await Promise.all(detailPages.map((page) => runDetailWorker(page)));
  await Promise.all(detailPages.map((page) => page.close()));
  await browser.close();

  const finalRows = [];
  const seenIdentity = new Set();

  for (const row of candidateRows) {
    if (!row) continue;
    if (liveSlugSet.has(row.slug)) continue;
    const identityKey = buildIdentityKey(row);
    if (liveIdentitySet.has(identityKey)) continue;
    if (seenIdentity.has(identityKey)) continue;

    seenIdentity.add(identityKey);
    finalRows.push(row);
  }

  const settledRawDetails = rawDetails.filter(Boolean);

  finalRows.sort((a, b) => {
    const cityCompare = a.city.localeCompare(b.city, "fr");
    if (cityCompare !== 0) return cityCompare;
    return a.last_name.localeCompare(b.last_name, "fr");
  });

  fs.writeFileSync(
    path.join(outputDir, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-department-${options.department}-raw.json`),
    JSON.stringify(settledRawDetails, null, 2) + "\n",
    "utf8"
  );

  fs.writeFileSync(
    path.join(outputDir, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-department-${options.department}.json`),
    JSON.stringify(finalRows, null, 2) + "\n",
    "utf8"
  );

  writeTsv(
    path.join(outputDir, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-department-${options.department}-search-audit.tsv`),
    [
      "department_code",
      "commune_name",
      "priority_in_department",
      "new_unique_places",
      "new_relevant_places",
      "total_unique_places",
      "stale_query_count"
    ],
    searchAudit
  );

  writeTsv(
    path.join(outputDir, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-department-${options.department}.tsv`),
    [
      "first_name",
      "last_name",
      "slug",
      "adresse",
      "postal_code",
      "city",
      "lat",
      "lng",
      "phone",
      "email",
      "website",
      "booking_url",
      "description",
      "status"
    ],
    finalRows
  );

  console.log(`Queries: ${selectedQueries.length}`);
  console.log(`Unique places collected: ${placeEntries.length}`);
  console.log(`Likely relevant places: ${likelyRelevantPlaces.length}`);
  console.log(`Final practitioner rows: ${finalRows.length}`);
  console.log(`Output dir: ${outputDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
