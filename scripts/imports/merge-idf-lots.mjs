import fs from "node:fs";
import path from "node:path";

const CAMPAIGN_DATE = "2026-03-23";
const BASE_DIR = path.resolve(`imports/ile-de-france/google-maps/${CAMPAIGN_DATE}`);
const IMPORT_HEADERS = [
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
];

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

function isLowConfidenceName(row) {
  const firstName = normalizeText(row.first_name);
  const lastName = normalizeText(row.last_name);
  const combined = `${firstName} ${lastName}`;
  const noisyFragments = ["naturo", "wellness", "shop", "coach", "bio", "cabinet", "centre"];
  const weakFirstNames = new Set(["dr", "m", "miss", "le", "so"]);

  return (
    firstName.length <= 1 ||
    lastName.length <= 1 ||
    weakFirstNames.has(firstName) ||
    noisyFragments.some((fragment) => combined.includes(fragment))
  );
}

function loadDepartmentRows() {
  const departmentDirs = fs
    .readdirSync(BASE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("department-"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "fr"));

  const rows = [];
  const summary = [];

  for (const dirName of departmentDirs) {
    const departmentCode = dirName.replace("department-", "");
    const jsonPath = path.join(
      BASE_DIR,
      dirName,
      `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-department-${departmentCode}.json`
    );

    if (!fs.existsSync(jsonPath)) continue;

    const departmentRows = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    summary.push({
      department_code: departmentCode,
      row_count: departmentRows.length
    });

    for (const row of departmentRows) {
      rows.push({
        ...row,
        department_code: departmentCode
      });
    }
  }

  return { rows, summary };
}

function main() {
  const { rows, summary } = loadDepartmentRows();
  const seenSlugs = new Set();
  const seenIdentityKeys = new Set();
  const merged = [];

  for (const row of rows) {
    const identityKey = buildIdentityKey(row);
    if (seenSlugs.has(row.slug) || seenIdentityKeys.has(identityKey)) {
      continue;
    }

    seenSlugs.add(row.slug);
    seenIdentityKeys.add(identityKey);
    merged.push(row);
  }

  merged.sort((a, b) => {
    const cityCompare = a.city.localeCompare(b.city, "fr");
    if (cityCompare !== 0) return cityCompare;
    return a.last_name.localeCompare(b.last_name, "fr");
  });

  const importRows = merged.map((row) =>
    Object.fromEntries(IMPORT_HEADERS.map((header) => [header, row[header] ?? ""]))
  );
  const manualReviewRows = merged.filter(isLowConfidenceName);

  fs.writeFileSync(
    path.join(BASE_DIR, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}.json`),
    JSON.stringify(importRows, null, 2) + "\n",
    "utf8"
  );

  writeTsv(path.join(BASE_DIR, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}.tsv`), IMPORT_HEADERS, importRows);

  fs.writeFileSync(
    path.join(BASE_DIR, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-manual-review.json`),
    JSON.stringify(manualReviewRows, null, 2) + "\n",
    "utf8"
  );

  writeTsv(
    path.join(BASE_DIR, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-manual-review.tsv`),
    [...IMPORT_HEADERS, "department_code"],
    manualReviewRows.map((row) => ({
      ...Object.fromEntries(IMPORT_HEADERS.map((header) => [header, row[header] ?? ""])),
      department_code: row.department_code
    }))
  );

  fs.writeFileSync(
    path.join(BASE_DIR, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-with-source.json`),
    JSON.stringify(merged, null, 2) + "\n",
    "utf8"
  );

  const summaryPayload = {
    campaign_date: CAMPAIGN_DATE,
    department_counts: summary,
    total_rows_before_dedupe: rows.length,
    total_rows_after_dedupe: merged.length,
    manual_review_count: manualReviewRows.length
  };

  fs.writeFileSync(
    path.join(BASE_DIR, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-summary.json`),
    JSON.stringify(summaryPayload, null, 2) + "\n",
    "utf8"
  );

  const summaryMarkdown = `# Ile-de-France Google Maps ${CAMPAIGN_DATE}

- Scope: premier passage Google Maps hors Paris, communes d'au moins 5000 habitants.
- Lignes par departement:
${summary.map((item) => `  - ${item.department_code}: ${item.row_count}`).join("\n")}
- Total avant dedoublonnage: ${rows.length}
- Total apres dedoublonnage: ${merged.length}

Fichiers generes:

- \`naturocarte-idf-google-maps-${CAMPAIGN_DATE}.tsv\`: lot TSV import-ready pour Supabase
- \`naturocarte-idf-google-maps-${CAMPAIGN_DATE}.json\`: meme lot en JSON import-ready
- \`naturocarte-idf-google-maps-${CAMPAIGN_DATE}-with-source.json\`: version enrichie avec metadonnees source Google Maps
- \`naturocarte-idf-google-maps-${CAMPAIGN_DATE}-manual-review.tsv\`: sous-lot des noms a verifier manuellement
- \`naturocarte-idf-google-maps-${CAMPAIGN_DATE}-summary.json\`: resume machine-readable
`;

  fs.writeFileSync(
    path.join(BASE_DIR, `naturocarte-idf-google-maps-${CAMPAIGN_DATE}-summary.md`),
    summaryMarkdown,
    "utf8"
  );

  console.log(`Departments merged: ${summary.length}`);
  console.log(`Rows before dedupe: ${rows.length}`);
  console.log(`Rows after dedupe: ${merged.length}`);
  console.log(`Output dir: ${BASE_DIR}`);
}

main();
