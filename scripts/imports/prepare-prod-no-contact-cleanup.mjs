import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const CAMPAIGN_DATE = "2026-03-23";
const DEFAULT_ENV = path.resolve(".env.local");
const OUTPUT_DIR = path.resolve(`imports/prod/no-contact-cleanup/${CAMPAIGN_DATE}`);
const OUTPUT_PREFIX = `naturocarte-prod-no-contact-cleanup-${CAMPAIGN_DATE}`;
const TSV_HEADERS = [
  "slug",
  "first_name",
  "last_name",
  "city",
  "status",
  "phone",
  "email",
  "website",
  "booking_url"
];

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    process.env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim() !== "";
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + "\n", "utf8");
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
    .select("slug, first_name, last_name, city, status, phone, email, website, booking_url")
    .order("slug", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

function buildDeleteSql(rows) {
  return rows
    .map(
      (row) => `DELETE FROM practitioners
WHERE slug = '${row.slug.replace(/'/g, "''")}'
  AND COALESCE(phone, '') = ''
  AND COALESCE(email, '') = ''
  AND COALESCE(website, '') = ''
  AND COALESCE(booking_url, '') = '';`
    )
    .join("\n\n")
    .concat(rows.length ? "\n" : "");
}

function buildSummary(rows) {
  const byCity = Object.entries(
    rows.reduce((accumulator, row) => {
      accumulator[row.city] = (accumulator[row.city] ?? 0) + 1;
      return accumulator;
    }, {})
  )
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "fr"))
    .map(([city, count]) => ({ city, count }));

  return {
    campaign_date: CAMPAIGN_DATE,
    generated_at: new Date().toISOString(),
    total_rows: rows.length,
    cities: byCity
  };
}

async function main() {
  loadEnv(DEFAULT_ENV);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const liveRows = await fetchLivePractitioners();
  const targetRows = liveRows.filter(
    (row) =>
      !nonEmpty(row.phone) &&
      !nonEmpty(row.email) &&
      !nonEmpty(row.website) &&
      !nonEmpty(row.booking_url)
  );

  const jsonPath = path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}.json`);
  const tsvPath = path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}.tsv`);
  const sqlPath = path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}.sql`);
  const summaryPath = path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}-summary.json`);

  writeJson(jsonPath, targetRows);
  writeTsv(tsvPath, TSV_HEADERS, targetRows);
  fs.writeFileSync(sqlPath, buildDeleteSql(targetRows), "utf8");
  writeJson(summaryPath, buildSummary(targetRows));

  console.log(`Live practitioners: ${liveRows.length}`);
  console.log(`No-contact practitioners: ${targetRows.length}`);
  console.log(`Output prefix: ${path.join(OUTPUT_DIR, OUTPUT_PREFIX)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
