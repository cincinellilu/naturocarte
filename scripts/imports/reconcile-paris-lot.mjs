import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_DIR = "imports/paris/google-maps/2026-03-20";
const DEFAULT_ENV = ".env.local";

const FILES = {
  main: "naturocarte-paris-google-maps-2026-03-20.tsv",
  json: "naturocarte-paris-google-maps-2026-03-20.json",
  exclusionsRecovered: "naturocarte-paris-google-maps-2026-03-20-exclusions-recovered.tsv",
  manualKeeps: "naturocarte-paris-google-maps-2026-03-20-manual-keeps.tsv"
};

function parseArgs(argv) {
  const options = {
    dir: DEFAULT_DIR,
    env: DEFAULT_ENV,
    offline: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--dir") {
      options.dir = argv[i + 1] ?? options.dir;
      i += 1;
      continue;
    }

    if (arg === "--env") {
      options.env = argv[i + 1] ?? options.env;
      i += 1;
      continue;
    }

    if (arg === "--offline") {
      options.offline = true;
    }
  }

  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function normalizeText(value) {
  return (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function identityKey(row) {
  return [
    normalizeText(row.last_name),
    normalizeText(row.adresse),
    normalizeText(row.postal_code),
    normalizeText(row.city)
  ].join("|");
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

function buildArchivedRows(lot) {
  return [
    ...lot.main.map((row) => ({ ...row, archived_source: "main" })),
    ...lot.exclusionsRecovered.map((row) => ({
      ...row,
      archived_source: "exclusions_recovered"
    })),
    ...lot.manualKeeps.map((row) => ({ ...row, archived_source: "manual_keeps" }))
  ];
}

function printSection(title) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
}

async function fetchPublishedPractitioners() {
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
    .select("slug, first_name, last_name, adresse, postal_code, city, status, created_at")
    .in("status", ["published", "published_contacted"])
    .order("slug", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const lotDir = path.resolve(options.dir);
  const envPath = path.resolve(options.env);

  const mainTsvPath = path.join(lotDir, FILES.main);
  const jsonPath = path.join(lotDir, FILES.json);
  const exclusionsRecoveredPath = path.join(lotDir, FILES.exclusionsRecovered);
  const manualKeepsPath = path.join(lotDir, FILES.manualKeeps);

  const lot = {
    main: readTsv(mainTsvPath),
    json: readJson(jsonPath),
    exclusionsRecovered: readTsv(exclusionsRecoveredPath),
    manualKeeps: readTsv(manualKeepsPath)
  };

  const archivedRows = buildArchivedRows(lot);
  const archivedBySlug = new Map(archivedRows.map((row) => [row.slug, row]));

  console.log("Paris import lot reconciliation");
  console.log(`Lot directory: ${lotDir}`);
  console.log(`Env file: ${envPath}`);

  printSection("Archived files");
  console.log(`main TSV rows: ${lot.main.length}`);
  console.log(`JSON rows: ${lot.json.length}`);
  console.log(`exclusions recovered rows: ${lot.exclusionsRecovered.length}`);
  console.log(`manual keeps rows: ${lot.manualKeeps.length}`);
  console.log(`unique archived slugs: ${archivedBySlug.size}`);

  if (options.offline) {
    console.log("\nOffline mode enabled. Live Supabase reconciliation skipped.");
    return;
  }

  loadEnv(envPath);
  const liveRows = await fetchPublishedPractitioners();
  const liveBySlug = new Map(liveRows.map((row) => [row.slug, row]));
  const liveByIdentity = new Map(liveRows.map((row) => [identityKey(row), row]));

  const prodOnly = liveRows.filter((row) => !archivedBySlug.has(row.slug));
  const archivedOnly = archivedRows.filter((row) => !liveBySlug.has(row.slug));
  const probableRenames = archivedOnly
    .map((row) => {
      const liveMatch = liveByIdentity.get(identityKey(row));
      if (!liveMatch) return null;

      return {
        archived_slug: row.slug,
        live_slug: liveMatch.slug,
        name: `${row.first_name} ${row.last_name}`.trim(),
        postal_code: row.postal_code,
        adresse: row.adresse
      };
    })
    .filter(Boolean);

  printSection("Live Supabase");
  console.log(`published practitioners: ${liveRows.length}`);
  console.log(
    `main rows already present in prod: ${lot.main.filter((row) => liveBySlug.has(row.slug)).length}`
  );
  console.log(
    `exclusions recovered already present in prod: ${
      lot.exclusionsRecovered.filter((row) => liveBySlug.has(row.slug)).length
    }`
  );
  console.log(
    `manual keeps already present in prod: ${
      lot.manualKeeps.filter((row) => liveBySlug.has(row.slug)).length
    }`
  );
  console.log(`prod rows not present in archived files: ${prodOnly.length}`);
  console.log(`archived rows not present in prod by slug: ${archivedOnly.length}`);

  if (probableRenames.length > 0) {
    printSection("Probable slug renames or enrichments");
    for (const item of probableRenames) {
      console.log(
        `${item.archived_slug} -> ${item.live_slug} (${item.name}, ${item.adresse}, ${item.postal_code})`
      );
    }
  }

  if (prodOnly.length > 0) {
    printSection("Prod rows missing from archived files");
    for (const row of prodOnly) {
      console.log(
        `${row.slug} | ${row.first_name} ${row.last_name} | ${row.postal_code} | created_at=${row.created_at}`
      );
    }
  }

  if (archivedOnly.length > 0) {
    printSection("Archived rows missing from prod by slug");
    for (const row of archivedOnly) {
      console.log(
        `${row.slug} | ${row.first_name} ${row.last_name} | ${row.archived_source} | ${row.postal_code}`
      );
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
