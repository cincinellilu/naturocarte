import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const REGION_CODE = "11";
const CAMPAIGN_DATE = "2026-03-23";
const OUTPUT_DIR = path.resolve(`imports/ile-de-france/google-maps/${CAMPAIGN_DATE}`);
const PARIS_LOT_DIR = path.resolve("imports/paris/google-maps/2026-03-20");
const DEFAULT_ENV = path.resolve(".env.local");
const IDF_DEPARTMENT_CODES = new Set(["77", "78", "91", "92", "93", "94", "95"]);
const IDF_POSTAL_PREFIXES = ["77", "78", "91", "92", "93", "94", "95"];

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

function isParisRow(row) {
  const city = normalizeText(row.city);
  const postalCode = (row.postal_code ?? "").trim();
  return city === "paris" && postalCode.startsWith("75");
}

function parseFullAddress(fullAddress) {
  const raw = (fullAddress ?? "").trim();
  if (!raw) {
    return {
      adresse: "",
      postal_code: "",
      city: ""
    };
  }

  const match = raw.match(/^(.*?)(?:,\s*)?(\d{5})\s+(.+)$/);
  if (!match) {
    return {
      adresse: raw,
      postal_code: "",
      city: ""
    };
  }

  return {
    adresse: match[1].trim().replace(/,\s*$/, ""),
    postal_code: match[2].trim(),
    city: match[3].trim()
  };
}

function isLikelyIleDeFrance(row, communeNames) {
  const postalCode = (row.postal_code ?? "").trim();
  if (IDF_POSTAL_PREFIXES.some((prefix) => postalCode.startsWith(prefix))) {
    return true;
  }

  const city = normalizeText(row.city);
  if (city && communeNames.has(city)) {
    return true;
  }

  const lat = Number(row.lat);
  const lng = Number(row.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 48.1 && lat <= 49.3 && lng >= 1.3 && lng <= 3.7;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "naturocarte-import-prep/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  return response.json();
}

async function fetchDepartments() {
  const departments = await fetchJson(
    `https://geo.api.gouv.fr/regions/${REGION_CODE}/departements?fields=nom,code`
  );

  return departments.filter((department) => IDF_DEPARTMENT_CODES.has(department.code));
}

async function fetchCommunesByDepartment(department) {
  const communes = await fetchJson(
    `https://geo.api.gouv.fr/departements/${department.code}/communes?fields=nom,code,codesPostaux,population`
  );

  return communes.map((commune) => ({
    department_code: department.code,
    department_name: department.nom,
    commune_code: commune.code,
    commune_name: commune.nom,
    postal_codes: (commune.codesPostaux ?? []).join(","),
    population: commune.population ?? 0
  }));
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
    .select("slug, first_name, last_name, adresse, postal_code, city, lat, lng, phone, email, website, booking_url, description, status")
    .order("city", { ascending: true })
    .order("last_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

function buildSearchPlan(communes) {
  const byDepartment = new Map();

  for (const commune of communes) {
    const bucket = byDepartment.get(commune.department_code) ?? [];
    bucket.push(commune);
    byDepartment.set(commune.department_code, bucket);
  }

  const rows = [];

  for (const [departmentCode, departmentCommunes] of [...byDepartment.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "fr")
  )) {
    departmentCommunes.sort((a, b) => {
      if (b.population !== a.population) return b.population - a.population;
      return a.commune_name.localeCompare(b.commune_name, "fr");
    });

    departmentCommunes.forEach((commune, index) => {
      const query = `naturopathe ${commune.commune_name} ${commune.department_name}`;
      rows.push({
        department_code: commune.department_code,
        department_name: commune.department_name,
        commune_code: commune.commune_code,
        commune_name: commune.commune_name,
        postal_codes: commune.postal_codes,
        population: String(commune.population),
        priority_in_department: String(index + 1),
        google_maps_query: query,
        google_maps_search_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      });
    });
  }

  return rows;
}

function buildCarryOverSeeds(communeNames, liveRows) {
  const exclusionsRows = readTsv(
    path.join(PARIS_LOT_DIR, "naturocarte-paris-google-maps-2026-03-20-exclusions-remaining.tsv")
  );
  const importViewRows = readTsv(
    path.join(PARIS_LOT_DIR, "naturocarte-paris-google-maps-2026-03-20-exclusions-remaining-import-view.tsv")
  );

  const importViewByKey = new Map(
    importViewRows.map((row) => [
      [row.lat, row.lng, row.website, row.phone].join("|"),
      row
    ])
  );
  const liveSlugSet = new Set(liveRows.map((row) => row.slug));
  const liveIdentitySet = new Set(liveRows.map(buildIdentityKey));

  return exclusionsRows
    .filter((row) => row.skip_reason === "not_paris")
    .map((row) => {
      const importView = importViewByKey.get([row.lat, row.lng, row.website, row.phone].join("|"));
      const firstName = importView?.first_name?.trim() ?? "";
      const lastName = importView?.last_name?.trim() ?? "";
      const parsedAddress = parseFullAddress(row.full_address);
      const adresse = row.adresse?.trim() || parsedAddress.adresse;
      const postalCode = row.postal_code?.trim() || parsedAddress.postal_code;
      const city = row.city?.trim() || parsedAddress.city;
      const slugBase = [firstName, lastName, city].filter(Boolean).map(slugify).join("-");
      const normalized = {
        first_name: firstName,
        last_name: lastName.toUpperCase(),
        slug: slugBase,
        adresse,
        postal_code: postalCode,
        city,
        lat: row.lat?.trim() ?? "",
        lng: row.lng?.trim() ?? "",
        phone: row.phone?.trim() ?? "",
        email: "",
        website: row.website?.trim() ?? "",
        booking_url: "",
        description: "",
        status: "idf_seed_from_paris_leftovers_20260323",
        source_google_hexid: row.hexid?.trim() ?? "",
        source_google_maps_url: row.maps_url?.trim() ?? "",
        source_title: row.title?.trim() ?? "",
        source_skip_reason: row.skip_reason?.trim() ?? ""
      };

      return normalized;
    })
    .filter((row) => row.first_name && row.last_name && row.slug)
    .filter((row) => isLikelyIleDeFrance(row, communeNames))
    .filter((row) => !liveSlugSet.has(row.slug))
    .filter((row) => !liveIdentitySet.has(buildIdentityKey(row)));
}

function buildReadme({
  departments,
  communes,
  searchPlan,
  liveRows,
  liveNonParisRows,
  carryOverSeeds
}) {
  const topDepartments = departments
    .map((department) => {
      const count = communes.filter((commune) => commune.department_code === department.code).length;
      return `- ${department.code} ${department.nom}: ${count} communes`;
    })
    .join("\n");

  const liveNonParisList = liveNonParisRows.length
    ? liveNonParisRows
        .map(
          (row) =>
            `- ${row.slug} | ${row.first_name} ${row.last_name} | ${row.adresse}, ${row.postal_code} ${row.city}`
        )
        .join("\n")
    : "- Aucun praticien hors Paris en prod";

  const carryOverList = carryOverSeeds.length
    ? carryOverSeeds
        .map(
          (row) =>
            `- ${row.slug} | ${row.first_name} ${row.last_name} | ${row.adresse}, ${row.postal_code} ${row.city}`
        )
        .join("\n")
    : "- Aucun candidat exploitable a recuperer depuis les exclusions Paris";

  return `# Ile-de-France Google Maps ${CAMPAIGN_DATE}

Preparation de campagne Google Maps pour l'Ile-de-France, en excluant Paris deja traite.

## Perimetre

- Region officielle: Ile-de-France (code ${REGION_CODE})
- Departements inclus: 77, 78, 91, 92, 93, 94, 95
- Paris (75) exclu volontairement

## Synthese

- Communes hors Paris couvertes par le plan: ${communes.length}
- Requetes Google Maps preparees: ${searchPlan.length}
- Fiches actuellement en prod: ${liveRows.length}
- Fiches actuellement en prod hors Paris: ${liveNonParisRows.length}
- Candidats recuperables depuis les exclusions du lot Paris: ${carryOverSeeds.length}

## Communes par departement

${topDepartments}

## Fichiers

- \`idf-search-plan.tsv\`: plan de recherche Google Maps par commune, trie par population au sein de chaque departement.
- \`idf-live-non-paris.tsv\`: snapshot des fiches deja presentes en prod hors Paris.
- \`idf-seed-from-paris-leftovers.tsv\`: candidats Ile-de-France recuperes des exclusions du lot Paris et absents de la prod.
- \`idf-seed-from-paris-leftovers.json\`: meme contenu avec metadonnees source Google Maps.

## Existant hors Paris deja en prod

${liveNonParisList}

## Reliquats utilises depuis le lot Paris

${carryOverList}

## Prochaine etape conseillee

1. Parcourir \`idf-search-plan.tsv\` par departement.
2. Extraire les resultats Google Maps bruts par communes ou par lots de communes.
3. Rejouer le meme filtrage/dedoublonnage avant import Supabase.
`;
}

async function main() {
  loadEnv(DEFAULT_ENV);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const departments = await fetchDepartments();
  const communesNested = await Promise.all(
    departments.map((department) => fetchCommunesByDepartment(department))
  );
  const communes = communesNested.flat();
  const searchPlan = buildSearchPlan(communes);
  const communeNames = new Set(communes.map((commune) => normalizeText(commune.commune_name)));

  const liveRows = await fetchLivePractitioners();
  const liveNonParisRows = liveRows.filter((row) => !isParisRow(row));
  const carryOverSeeds = buildCarryOverSeeds(communeNames, liveRows);

  writeTsv(
    path.join(OUTPUT_DIR, "idf-search-plan.tsv"),
    [
      "department_code",
      "department_name",
      "commune_code",
      "commune_name",
      "postal_codes",
      "population",
      "priority_in_department",
      "google_maps_query",
      "google_maps_search_url"
    ],
    searchPlan
  );

  writeTsv(
    path.join(OUTPUT_DIR, "idf-live-non-paris.tsv"),
    [
      "slug",
      "first_name",
      "last_name",
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
    liveNonParisRows
  );

  writeTsv(
    path.join(OUTPUT_DIR, "idf-seed-from-paris-leftovers.tsv"),
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
    carryOverSeeds
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "idf-seed-from-paris-leftovers.json"),
    JSON.stringify(carryOverSeeds, null, 2) + "\n",
    "utf8"
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "README.md"),
    buildReadme({
      departments,
      communes,
      searchPlan,
      liveRows,
      liveNonParisRows,
      carryOverSeeds
    }),
    "utf8"
  );

  console.log(`Prepared Ile-de-France campaign in ${OUTPUT_DIR}`);
  console.log(`Departments: ${departments.length}`);
  console.log(`Communes: ${communes.length}`);
  console.log(`Search rows: ${searchPlan.length}`);
  console.log(`Live non-Paris practitioners: ${liveNonParisRows.length}`);
  console.log(`Carry-over seeds from Paris leftovers: ${carryOverSeeds.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
