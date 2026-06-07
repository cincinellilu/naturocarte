import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

let cachedFileEnv: Map<string, string> | null = null;
let cachedEnvCandidateFiles: string[] | null = null;
const warnedMissingEnvNames = new Set<string>();

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
    let line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("export ")) {
      line = line.slice("export ".length).trim();
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);

    if (!key) continue;
    entries.set(key, normalizeEnvValue(value));
  }

  return entries;
}

function getEnvSearchDirectories(): string[] {
  const directories: string[] = [];
  let currentDirectory = process.cwd();

  while (currentDirectory && !directories.includes(currentDirectory)) {
    directories.push(currentDirectory);

    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) break;
    currentDirectory = parentDirectory;
  }

  return directories;
}

function getCandidateFiles(): string[] {
  if (cachedEnvCandidateFiles) return cachedEnvCandidateFiles;

  const candidateFiles: string[] = [];
  const fileNames = [".env.production", ".env.local", ".env"];

  for (const directory of getEnvSearchDirectories()) {
    for (const fileName of fileNames) {
      const filePath = join(directory, fileName);
      if (!candidateFiles.includes(filePath)) {
        candidateFiles.push(filePath);
      }
    }
  }

  cachedEnvCandidateFiles = candidateFiles;
  return candidateFiles;
}

function loadFileEnv(): Map<string, string> {
  if (cachedFileEnv) return cachedFileEnv;

  const env = new Map<string, string>();

  for (const filePath of getCandidateFiles()) {
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
  if (!fileValue && !warnedMissingEnvNames.has(name)) {
    warnedMissingEnvNames.add(name);
    console.warn(`[server-env] Missing ${name}`, {
      cwd: process.cwd(),
      checkedFiles: getCandidateFiles().filter((filePath) => existsSync(filePath))
    });
  }

  return fileValue || undefined;
}
