import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const CAMPAIGN_DATE = "2026-03-23";
const OUTPUT_DIR = path.resolve(`imports/prod/email-enrichment/${CAMPAIGN_DATE}`);
const DEFAULT_ENV = path.resolve(".env.local");
const OUTPUT_PREFIX = `naturocarte-prod-email-enrichment-${CAMPAIGN_DATE}`;
const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "live.fr",
  "me.com",
  "orange.fr",
  "free.fr",
  "wanadoo.fr",
  "yahoo.com",
  "yahoo.fr",
  "outlook.com",
  "outlook.fr",
  "proton.me",
  "protonmail.com",
  "gmx.fr",
  "laposte.net",
  "bbox.fr",
  "sfr.fr"
]);
const BLOCKED_EMAIL_DOMAINS = [
  "amazon.com",
  "example.com",
  "example.org",
  "example.net",
  "monsite.com",
  "mysite.com",
  "wixpress.com",
  "sentry.io",
  "godaddy.com",
  "secureserver.net"
];
const BLOCKED_LOCAL_PARTS = [
  "noreply",
  "no-reply",
  "donotreply",
  "do-not-reply",
  "mailer-daemon",
  "postmaster",
  "webmaster",
  "hostmaster",
  "bounce",
  "notification",
  "notifications",
  "robot",
  "automate",
  "automatic"
];
const PLACEHOLDER_FRAGMENTS = [
  "example",
  "exemple",
  "mysite",
  "monsite",
  "yourname",
  "your-email",
  "yourmail",
  "john@doe"
];
const PLATFORM_HOSTS = [
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
const INTERNAL_LINK_HINTS = [
  "contact",
  "contactez",
  "a-propos",
  "apropos",
  "about",
  "mentions-legales",
  "mentions_legales",
  "mentions",
  "legal",
  "coordonnees",
  "rendez-vous",
  "reservation"
];
const TSV_HEADERS = [
  "slug",
  "first_name",
  "last_name",
  "city",
  "email",
  "website",
  "booking_url",
  "source_url",
  "source_kind",
  "page_type",
  "score",
  "reason"
];

function parseArgs(argv) {
  const options = {
    limit: null,
    concurrency: 8,
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

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    process.env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function normalizeText(value) {
  return (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function slugify(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim() !== "";
}

function htmlDecode(value) {
  return (value ?? "")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)));
}

function cleanupEmail(value) {
  return htmlDecode((value ?? "").trim())
    .replace(/^mailto:/i, "")
    .replace(/[)>.,;:'"]+$/g, "")
    .trim()
    .toLowerCase();
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeWebsiteUrl(value) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (isHttpUrl(raw)) return raw;
  if (isHttpUrl(`https://${raw}`)) return `https://${raw}`;
  return "";
}

function getBaseHost(hostname) {
  const labels = hostname.toLowerCase().split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");
  return labels.slice(-2).join(".");
}

function simplifyDomainToken(value) {
  return (value ?? "").toLowerCase().replace(/^www\./, "").replace(/[^a-z0-9]/g, "");
}

function isPlatformHost(hostname) {
  return PLATFORM_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

function isAllowedBookingSource(url) {
  if (!isHttpUrl(url)) return false;

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return !isPlatformHost(hostname);
  } catch {
    return false;
  }
}

function decodeCloudflareEmail(encoded) {
  if (!encoded || encoded.length < 2) return "";
  try {
    const key = Number.parseInt(encoded.slice(0, 2), 16);
    let output = "";

    for (let index = 2; index < encoded.length; index += 2) {
      const value = Number.parseInt(encoded.slice(index, index + 2), 16) ^ key;
      output += String.fromCharCode(value);
    }

    return cleanupEmail(output);
  } catch {
    return "";
  }
}

function extractCfEmails(html) {
  const values = [];
  const regex = /data-cfemail=["']([0-9a-f]+)["']/gi;

  for (const match of html.matchAll(regex)) {
    const decoded = decodeCloudflareEmail(match[1]);
    if (decoded) values.push(decoded);
  }

  return values;
}

function extractMailtoEmails(html) {
  const values = [];
  const regex = /mailto:([^"'?#\s>]+)/gi;

  for (const match of html.matchAll(regex)) {
    const email = cleanupEmail(match[1]);
    if (email) values.push(email);
  }

  return values;
}

function extractPlainEmails(html) {
  const text = htmlDecode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
  const values = [];
  const regex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

  for (const match of text.matchAll(regex)) {
    const email = cleanupEmail(match[0]);
    if (email) values.push(email);
  }

  const obfuscatedText = text
    .replace(/\s*\[\s*at\s*\]\s*/gi, "@")
    .replace(/\s*\(\s*at\s*\)\s*/gi, "@")
    .replace(/\s+at\s+/gi, "@")
    .replace(/\s*\[\s*dot\s*\]\s*/gi, ".")
    .replace(/\s*\(\s*dot\s*\)\s*/gi, ".")
    .replace(/\s+dot\s+/gi, ".");

  for (const match of obfuscatedText.matchAll(regex)) {
    const email = cleanupEmail(match[0]);
    if (email) values.push(email);
  }

  return values;
}

function extractLinks(html, sourceUrl) {
  const values = [];
  const regex = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(regex)) {
    const rawHref = htmlDecode(match[1]).trim();
    if (!rawHref) continue;

    try {
      const href = new URL(rawHref, sourceUrl).toString();
      const anchorText = htmlDecode(match[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
      values.push({ href, text: anchorText });
    } catch {
      continue;
    }
  }

  return values;
}

function dedupeBy(rows, keyFn) {
  const seen = new Set();
  const result = [];

  for (const row of rows) {
    const key = keyFn(row);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row);
  }

  return result;
}

function buildSourceCandidates(row) {
  const sources = [];
  const website = normalizeWebsiteUrl(row.website);
  const bookingUrl = normalizeWebsiteUrl(row.booking_url);

  if (website) {
    sources.push({ url: website, page_type: "website_home" });
  }

  if (bookingUrl && (!website || bookingUrl !== website) && isAllowedBookingSource(bookingUrl)) {
    sources.push({ url: bookingUrl, page_type: "booking_source" });
  }

  return dedupeBy(sources, (item) => item.url);
}

function buildInternalTargets(sourceUrl, links) {
  let sourceHost = "";
  try {
    sourceHost = new URL(sourceUrl).hostname.toLowerCase();
  } catch {
    return [];
  }

  const candidates = [];

  for (const link of links) {
    try {
      const parsed = new URL(link.href);
      const normalized = normalizeText(`${parsed.pathname} ${link.text}`);
      if (parsed.hostname.toLowerCase() !== sourceHost) continue;
      if (normalized.includes("mailto:")) continue;
      if (!INTERNAL_LINK_HINTS.some((hint) => normalized.includes(hint))) continue;

      let pageType = "internal";
      if (normalized.includes("contact")) pageType = "contact";
      if (normalized.includes("mention")) pageType = "legal";
      if (normalized.includes("about") || normalized.includes("a-propos") || normalized.includes("apropos")) {
        pageType = "about";
      }

      candidates.push({
        url: parsed.toString(),
        page_type: pageType
      });
    } catch {
      continue;
    }
  }

  const priority = { contact: 0, legal: 1, about: 2, internal: 3 };
  return dedupeBy(candidates, (item) => item.url)
    .sort((left, right) => priority[left.page_type] - priority[right.page_type])
    .slice(0, 4);
}

function isEmailSyntaxValid(email) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

function hasWeirdStructure(email) {
  const [localPart = "", domain = ""] = email.split("@");
  const digitCount = (localPart.match(/\d/g) ?? []).length;

  return (
    localPart.length > 36 ||
    /\.\./.test(localPart) ||
    digitCount >= 6 ||
    /^[a-f0-9]{10,}$/i.test(localPart) ||
    /[a-z]{2,}\d{5,}/i.test(localPart) ||
    domain.split(".").some((segment) => segment.length > 25)
  );
}

function evaluateEmailCandidate(candidate, row, context) {
  const email = cleanupEmail(candidate.email);
  const reasons = [];

  if (!isEmailSyntaxValid(email)) {
    return { status: "reject", score: -100, reason: "invalid_syntax", email };
  }

  if (PLACEHOLDER_FRAGMENTS.some((fragment) => email.includes(fragment))) {
    return { status: "reject", score: -100, reason: "placeholder_email", email };
  }

  const [localPart = "", domain = ""] = email.split("@");
  if (
    BLOCKED_EMAIL_DOMAINS.some((blocked) => domain === blocked || domain.endsWith(`.${blocked}`)) ||
    BLOCKED_LOCAL_PARTS.some((blocked) => localPart === blocked || localPart.includes(blocked))
  ) {
    return { status: "reject", score: -100, reason: "blocked_pattern", email };
  }

  if (email.includes("amazon.com")) {
    return { status: "reject", score: -100, reason: "platform_email", email };
  }

  let score = 0;
  if (candidate.source_kind === "mailto") score += 20;
  if (candidate.source_kind === "cfemail") score += 18;
  if (candidate.page_type === "contact") score += 10;
  if (candidate.page_type === "legal") score += 8;
  if (candidate.page_type === "website_home") score += 6;

  const websiteUrl = normalizeWebsiteUrl(row.website);
  const websiteHost = websiteUrl ? new URL(websiteUrl).hostname.toLowerCase() : "";
  const websiteBaseHost = websiteHost ? getBaseHost(websiteHost) : "";
  const emailBaseHost = getBaseHost(domain);
  if (websiteBaseHost && emailBaseHost === websiteBaseHost) {
    score += 14;
    reasons.push("same_domain");
  } else if (
    websiteBaseHost &&
    simplifyDomainToken(emailBaseHost.replace(/\.[^.]+$/, "")) ===
      simplifyDomainToken(websiteBaseHost.replace(/\.[^.]+$/, ""))
  ) {
    score += 12;
    reasons.push("domain_similarity");
  } else if (PERSONAL_EMAIL_DOMAINS.has(domain)) {
    score += 8;
    reasons.push("personal_provider");
  } else if (websiteBaseHost) {
    score -= 10;
    reasons.push("domain_mismatch");
  }

  const identity = normalizeText(`${row.first_name} ${row.last_name}`);
  const localNormalized = normalizeText(localPart).replace(/[^a-z0-9]+/g, " ");
  if (
    localNormalized.includes(slugify(row.first_name)) ||
    localNormalized.includes(slugify(row.last_name).replace(/-/g, " ")) ||
    localNormalized.includes(identity.split(" ")[0] ?? "")
  ) {
    score += 7;
    reasons.push("name_match");
  }

  if (/(contact|bonjour|hello|cabinet|rdv|naturo|consult)/i.test(localPart)) {
    score += 4;
    reasons.push("business_local_part");
  }

  if (hasWeirdStructure(email)) {
    score -= 18;
    reasons.push("weird_structure");
  }

  const reason = reasons.join(",");
  if (score >= 24 && !reason.includes("weird_structure")) {
    return { status: "accept", score, reason, email };
  }

  if (
    score >= 21 &&
    !reason.includes("weird_structure") &&
    reason.includes("personal_provider") &&
    reason.includes("name_match")
  ) {
    return { status: "accept", score, reason, email };
  }

  if (score >= 14) {
    return { status: "review", score, reason: reason || "needs_review", email };
  }

  return { status: "reject", score, reason: reason || "low_score", email };
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; NaturoCarteEmailCrawler/1.0; +https://naturocarte.fr)"
    }
  });

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  if (!contentType.includes("text/html")) {
    throw new Error(`Unsupported content-type: ${contentType}`);
  }

  return {
    finalUrl: response.url,
    html: await response.text()
  };
}

function extractEmailCandidatesFromHtml(html, currentUrl, pageType) {
  const candidates = [];

  for (const email of extractMailtoEmails(html)) {
    candidates.push({
      email,
      source_url: currentUrl,
      source_kind: "mailto",
      page_type: pageType
    });
  }

  for (const email of extractCfEmails(html)) {
    candidates.push({
      email,
      source_url: currentUrl,
      source_kind: "cfemail",
      page_type: pageType
    });
  }

  for (const email of extractPlainEmails(html)) {
    candidates.push({
      email,
      source_url: currentUrl,
      source_kind: "text",
      page_type: pageType
    });
  }

  return dedupeBy(candidates, (candidate) => `${candidate.email}|${candidate.source_url}|${candidate.source_kind}`);
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
    .select("slug, first_name, last_name, city, email, website, booking_url, status")
    .order("slug", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

function buildSql(rows) {
  return rows
    .map(
      (row) =>
        `UPDATE practitioners\nSET email = '${row.email.replace(/'/g, "''")}'\nWHERE slug = '${row.slug.replace(/'/g, "''")}'\n  AND COALESCE(email, '') = '';`
    )
    .join("\n\n")
    .concat(rows.length ? "\n" : "");
}

function buildSummary(allRows, acceptedRows, reviewRows, startedAt) {
  return {
    campaign_date: CAMPAIGN_DATE,
    generated_at: new Date().toISOString(),
    duration_seconds: Math.round((Date.now() - startedAt) / 1000),
    scanned_rows: allRows.length,
    accepted_count: acceptedRows.length,
    review_count: reviewRows.length,
    no_email_found_count: allRows.filter((row) => row.result === "no_email_found").length,
    error_count: allRows.filter((row) => row.result === "error").length
  };
}

function persistArtifacts(allRows, acceptedRows, reviewRows, startedAt) {
  const jsonPath = path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}.json`);
  const tsvPath = path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}.tsv`);
  const sqlPath = path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}.sql`);
  const reviewPath = path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}-manual-review.tsv`);
  const summaryPath = path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}-summary.json`);

  writeJson(jsonPath, allRows);
  writeTsv(tsvPath, TSV_HEADERS, acceptedRows);
  fs.writeFileSync(sqlPath, buildSql(acceptedRows), "utf8");
  writeTsv(reviewPath, TSV_HEADERS, reviewRows);
  writeJson(summaryPath, buildSummary(allRows, acceptedRows, reviewRows, startedAt));
}

async function enrichRow(row) {
  const sourceCandidates = buildSourceCandidates(row);
  if (!sourceCandidates.length) {
    return {
      ...row,
      email: "",
      result: "no_source_url",
      source_url: "",
      source_kind: "",
      page_type: "",
      score: "",
      reason: "missing_website_and_booking_url"
    };
  }

  const visited = new Set();
  const queue = [...sourceCandidates];
  const gatheredCandidates = [];

  while (queue.length > 0 && visited.size < 6) {
    const target = queue.shift();
    if (!target || visited.has(target.url)) continue;
    visited.add(target.url);

    let fetched;
    try {
      fetched = await fetchHtml(target.url);
    } catch {
      continue;
    }

    const emailCandidates = extractEmailCandidatesFromHtml(fetched.html, fetched.finalUrl, target.page_type);
    gatheredCandidates.push(...emailCandidates);

    const internalTargets = buildInternalTargets(fetched.finalUrl, extractLinks(fetched.html, fetched.finalUrl));
    for (const internalTarget of internalTargets) {
      if (!visited.has(internalTarget.url)) {
        queue.push(internalTarget);
      }
    }
  }

  const evaluated = dedupeBy(gatheredCandidates, (candidate) => candidate.email).map((candidate) => ({
    ...candidate,
    ...evaluateEmailCandidate(candidate, row, {})
  }));

  const accepted = evaluated
    .filter((candidate) => candidate.status === "accept")
    .sort((left, right) => right.score - left.score || left.email.localeCompare(right.email, "fr"))[0];
  if (accepted) {
    return {
      ...row,
      email: accepted.email,
      source_url: accepted.source_url,
      source_kind: accepted.source_kind,
      page_type: accepted.page_type,
      score: accepted.score,
      reason: accepted.reason || "accepted",
      result: "accepted"
    };
  }

  const review = evaluated
    .filter((candidate) => candidate.status === "review")
    .sort((left, right) => right.score - left.score || left.email.localeCompare(right.email, "fr"))[0];
  if (review) {
    return {
      ...row,
      email: review.email,
      source_url: review.source_url,
      source_kind: review.source_kind,
      page_type: review.page_type,
      score: review.score,
      reason: review.reason || "review",
      result: "manual_review"
    };
  }

  return {
    ...row,
    email: "",
    source_url: "",
    source_kind: "",
    page_type: "",
    score: "",
    reason: evaluated.length ? "rejected_candidates" : "no_email_found",
    result: "no_email_found"
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  loadEnv(DEFAULT_ENV);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const liveRows = await fetchLivePractitioners();
  const slugFilter = new Set(options.slugs);
  const targetRows = liveRows
    .filter((row) => !nonEmpty(row.email))
    .filter((row) => (slugFilter.size ? slugFilter.has(row.slug) : true));
  const selectedRows =
    options.limit && Number.isFinite(options.limit) ? targetRows.slice(0, options.limit) : targetRows;

  const outputPath = path.join(OUTPUT_DIR, `${OUTPUT_PREFIX}.json`);
  const existingRows = options.fresh ? [] : readJson(outputPath, []);
  const existingMap = new Map(existingRows.map((row) => [row.slug, row]));

  if (slugFilter.size) {
    for (const slug of slugFilter) {
      existingMap.delete(slug);
    }
  }

  const pendingRows = selectedRows.filter((row) => !existingMap.has(row.slug));
  const startedAt = Date.now();

  console.log(`Live rows: ${liveRows.length}`);
  console.log(`Missing email rows: ${targetRows.length}`);
  console.log(`Selected rows: ${selectedRows.length}`);
  console.log(`Already processed: ${existingRows.length}`);
  console.log(`Pending rows: ${pendingRows.length}`);

  let cursor = 0;
  let completed = 0;

  const worker = async (workerIndex) => {
    while (cursor < pendingRows.length) {
      const row = pendingRows[cursor];
      cursor += 1;

      try {
        const enriched = await enrichRow(row);
        existingMap.set(row.slug, enriched);
        completed += 1;
        console.log(
          `[${completed}/${pendingRows.length}] worker=${workerIndex} ${row.slug} result=${enriched.result} email=${Boolean(
            enriched.email
          )}`
        );
      } catch (error) {
        existingMap.set(row.slug, {
          ...row,
          email: "",
          source_url: "",
          source_kind: "",
          page_type: "",
          score: "",
          reason: error instanceof Error ? error.message : String(error),
          result: "error"
        });
        completed += 1;
        console.log(`[${completed}/${pendingRows.length}] worker=${workerIndex} ${row.slug} result=error`);
      } finally {
        const persistedRows =
          !options.fresh && slugFilter.size
            ? Array.from(existingMap.values())
            : Array.from(existingMap.values()).filter((item) => selectedRows.some((row) => row.slug === item.slug));
        const acceptedRows = persistedRows.filter((row) => row.result === "accepted");
        const reviewRows = persistedRows.filter((row) => row.result === "manual_review");
        persistArtifacts(persistedRows, acceptedRows, reviewRows, startedAt);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.max(1, options.concurrency) }, (_, index) => worker(index + 1))
  );

  const persistedRows =
    !options.fresh && slugFilter.size
      ? Array.from(existingMap.values())
      : Array.from(existingMap.values()).filter((item) => selectedRows.some((row) => row.slug === item.slug));
  const acceptedRows = persistedRows.filter((row) => row.result === "accepted");
  const reviewRows = persistedRows.filter((row) => row.result === "manual_review");
  persistArtifacts(persistedRows, acceptedRows, reviewRows, startedAt);

  const summary = buildSummary(persistedRows, acceptedRows, reviewRows, startedAt);
  console.log(`Accepted: ${summary.accepted_count}`);
  console.log(`Manual review: ${summary.review_count}`);
  console.log(`No email found: ${summary.no_email_found_count}`);
  console.log(`Errors: ${summary.error_count}`);
  console.log(`Output prefix: ${path.join(OUTPUT_DIR, OUTPUT_PREFIX)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
