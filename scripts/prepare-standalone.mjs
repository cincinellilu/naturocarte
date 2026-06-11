import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, ".next", "standalone");
const standaloneNextRoot = path.join(standaloneRoot, ".next");

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectory(params) {
  const { source, destination } = params;

  if (!(await exists(source))) {
    return;
  }

  await rm(destination, { recursive: true, force: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}

await mkdir(standaloneRoot, { recursive: true });
await mkdir(standaloneNextRoot, { recursive: true });

await Promise.all([
  copyDirectory({
    source: path.join(projectRoot, "public"),
    destination: path.join(standaloneRoot, "public")
  }),
  copyDirectory({
    source: path.join(projectRoot, ".next", "static"),
    destination: path.join(standaloneNextRoot, "static")
  })
]);
