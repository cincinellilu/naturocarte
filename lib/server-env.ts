import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

let cachedFileEnv: Map<string, string> | null = null;

function normalizeEnvValue(value: string): string {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseEnvFile(content: string): Map<string, string> {
  const entries = new Map<string, string>();

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);

    if (!key) continue;
    entries.set(key, normalizeEnvValue(value));
  }

  return entries;
}

function loadFileEnv(): Map<string, string> {
  if (cachedFileEnv) return cachedFileEnv;

  const env = new Map<string, string>();
  const cwd = process.cwd();
  const candidateFiles = [
    join(cwd, ".env.production"),
    join(cwd, ".env.local"),
    join(cwd, ".env")
  ];

  for (const filePath of candidateFiles) {
    if (!existsSync(filePath)) continue;

    try {
      const fileContent = readFileSync(filePath, "utf8");
      const fileEntries = parseEnvFile(fileContent);

      for (const [key, value] of fileEntries.entries()) {
        if (!env.has(key)) env.set(key, value);
      }
    } catch {
      // Ignore unreadable env files and keep existing runtime variables.
    }
  }

  cachedFileEnv = env;
  return env;
}

export function getServerEnv(name: string): string | undefined {
  const runtimeValue = process.env[name]?.trim();
  if (runtimeValue) return runtimeValue;

  const fileValue = loadFileEnv().get(name)?.trim();
  return fileValue || undefined;
}
