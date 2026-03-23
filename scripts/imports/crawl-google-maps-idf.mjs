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
    headful: false
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
  const raw = (addressLabel ?? "").replace(/^Adresse:\s*/i, "").trim();
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

function parseName(title) {
  const normalized = (title ?? "")
    .replace(/Sponsorisé/gi, " ")
    .replace(/[|｜]/g, " - ")
    .replace(/\s+/g, " ")
    .trim();

  const stopKeywords = [
    "naturopathe",
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

  const firstSegment = normalized.split(" - ")[0].trim();
  const tokens = firstSegment.split(/\s+/);
  const kept = [];

  for (const token of tokens) {
    const lower = normalizeText(token);
    if (stopKeywords.includes(lower)) break;
    kept.push(token);
  }

  if (kept.length < 2) {
    return null;
  }

  const firstName = kept[0];
  const lastName = kept.slice(1).join(" ");

  const blockedPrefixes = ["cabinet", "centre", "formation", "studio", "maison", "prisma"];
  if (blockedPrefixes.includes(normalizeText(firstName))) {
    return null;
  }

  return {
    first_name: firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(),
    last_name: lastName.toUpperCase()
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
  await page.waitForTimeout(5000);

  const feed = page.locator('div[role="feed"]').first();
  if ((await feed.count()) > 0) {
    let previousCount = 0;
    let stablePasses = 0;

    while (stablePasses < 3) {
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
      await page.waitForTimeout(1500);
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
  await page.waitForTimeout(5000);

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

function toPractitionerRow(detail, placeUrl, departmentCode) {
  const parsedName = parseName(detail.title);
  if (!parsedName) return null;

  const address = parseAddress(detail.addressLabel);
  if (!address.postal_code || !address.city) return null;
  if (normalizeText(address.city) === "paris" || address.postal_code.startsWith("75")) return null;
  if (!/^(77|78|91|92|93|94|95)/.test(address.postal_code)) return null;
  if (detail.category && !/naturopathe/i.test(detail.category)) return null;

  const mapMeta = extractHexId(placeUrl);
  const slug = [parsedName.first_name, parsedName.last_name, address.city]
    .map(slugify)
    .filter(Boolean)
    .join("-");

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
    website: detail.website,
    booking_url: "",
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

  const browser = await chromium.launch({ headless: !options.headful });
  const context = await browser.newContext({ locale: "fr-FR" });
  const listPage = await context.newPage();
  const detailPage = await context.newPage();

  const uniquePlaces = new Map();

  for (const row of selectedQueries) {
    console.log(`Searching ${row.commune_name} (${row.department_code})`);
    const cards = await collectSearchResults(listPage, row.google_maps_search_url);
    for (const card of cards) {
      if (!card.href || !card.title) continue;
      if (!uniquePlaces.has(card.href)) {
        uniquePlaces.set(card.href, {
          ...card,
          commune_name: row.commune_name,
          department_code: row.department_code,
          department_name: row.department_name,
          query: row.google_maps_query
        });
      }
    }
  }

  const placeEntries = [...uniquePlaces.values()];
  const selectedDetails =
    options.maxDetails && Number.isFinite(options.maxDetails)
      ? placeEntries.slice(0, options.maxDetails)
      : placeEntries;

  const rawDetails = [];
  const finalRows = [];
  const seenIdentity = new Set();

  for (const place of selectedDetails) {
    console.log(`Detail ${place.title}`);
    const detail = await collectPlaceDetails(detailPage, place.href);
    const row = toPractitionerRow(detail, place.href, options.department);

    rawDetails.push({
      ...place,
      detail
    });

    if (!row) continue;
    if (liveSlugSet.has(row.slug)) continue;
    const identityKey = buildIdentityKey(row);
    if (liveIdentitySet.has(identityKey)) continue;
    if (seenIdentity.has(identityKey)) continue;

    seenIdentity.add(identityKey);
    finalRows.push(row);
  }

  await browser.close();

  finalRows.sort((a, b) => {
    const cityCompare = a.city.localeCompare(b.city, "fr");
    if (cityCompare !== 0) return cityCompare;
    return a.last_name.localeCompare(b.last_name, "fr");
  });

  fs.writeFileSync(
    path.join(outputDir, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-department-${options.department}-raw.json`),
    JSON.stringify(rawDetails, null, 2) + "\n",
    "utf8"
  );

  fs.writeFileSync(
    path.join(outputDir, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-department-${options.department}.json`),
    JSON.stringify(finalRows, null, 2) + "\n",
    "utf8"
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
  console.log(`Final practitioner rows: ${finalRows.length}`);
  console.log(`Output dir: ${outputDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
