import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";

const ADMIN_COOKIE = {
  name: "naturocarte_admin_prospects",
  value: "6fbe88b2178fcdaf39607596ac049160450416d50a6ab745bf0be1cbaa13172b",
  sameSite: "Lax",
  secure: false,
  httpOnly: false
};

const TARGETS = [
  {
    fileName: "admin-desktop.png",
    url: "http://localhost:3000/admin",
    viewport: { width: 1440, height: 1200 },
    fullPage: true
  },
  {
    fileName: "prospects-desktop.png",
    url: "http://localhost:3000/admin/prospects",
    viewport: { width: 1440, height: 1400 },
    fullPage: false
  },
  {
    fileName: "admin-mobile.png",
    url: "http://localhost:3000/admin",
    device: devices["iPhone 13"],
    fullPage: true
  },
  {
    fileName: "prospects-mobile.png",
    url: "http://localhost:3000/admin/prospects",
    device: devices["iPhone 13"],
    fullPage: false
  }
];

async function captureTarget(outputDirectory, target) {
  const browser = await chromium.launch({ headless: true });
  const context = target.device
    ? await browser.newContext(target.device)
    : await browser.newContext({ viewport: target.viewport });

  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("nc_cookie_consent", "accepted");
      document.cookie = "nc_cookie_consent=accepted; Path=/; SameSite=Lax";
    } catch {}
  });

  await context.addCookies([{ ...ADMIN_COOKIE, url: "http://localhost:3000" }]);

  const page = await context.newPage();
  await page.goto(target.url, { waitUntil: "networkidle" });

  await page.screenshot({
    path: path.join(outputDirectory, target.fileName),
    fullPage: target.fullPage
  });

  if (target.device) {
    const menuButton = page.getByRole("button", { name: "Admin" });
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.locator(".admin-sidebar.is-open").waitFor({ state: "visible" });
      await page.waitForTimeout(180);
      await page.screenshot({
        path: path.join(outputDirectory, target.fileName.replace(".png", "-menu.png")),
        fullPage: false
      });
    }
  }

  await context.close();
  await browser.close();
}

async function main() {
  const outputDirectory = path.resolve("scripts/tmp/admin-visual-check");
  await fs.mkdir(outputDirectory, { recursive: true });

  for (const target of TARGETS) {
    await captureTarget(outputDirectory, target);
  }

  console.log(outputDirectory);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
