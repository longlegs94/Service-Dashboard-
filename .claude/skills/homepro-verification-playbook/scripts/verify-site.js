/**
 * HomePro site verification: click-through + API probes + honest screenshots.
 *
 * Usage (remote sandbox):
 *   npm run build && npm run start &   # or: npm run dev
 *   NODE_PATH=/opt/node22/lib/node_modules node .claude/skills/homepro-verification-playbook/scripts/verify-site.js [baseUrl] [shotDir]
 *
 * Defaults: baseUrl=http://localhost:3000, shotDir=./verify-shots
 * Exits 1 if any check fails. Screenshot capture uses the stepwise-scroll recipe
 * (required — see homepro-debugging-playbook: scroll-reveal illusion).
 */
const { chromium } = require("playwright");
const fs = require("fs");

const BASE = process.argv[2] || "http://localhost:3000";
const SHOTS = process.argv[3] || "./verify-shots";
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const ok = (name, pass, detail = "") =>
  results.push(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);

async function fullReveal(page) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= h; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(350);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const jsErrors = [];
  page.on("pageerror", (e) => jsErrors.push(e.message));

  // 1. Pages return 200 with expected content
  const pages = [
    ["/", "Appliance repair,"],
    ["/services", "Appliance repair services"],
    ["/services/washer-repair", "Washer won"],
    ["/service-areas", "Lower Mainland"],
    ["/service-areas/surrey", "Surrey"],
    ["/book", "Book your repair"],
    ["/diagnose", "your appliance doing"],
    ["/about", "family business"],
    ["/contact", "real local expert"],
  ];
  for (const [path, text] of pages) {
    const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
    const body = await page.textContent("body");
    ok(`GET ${path}`, res.status() === 200 && body.includes(text), `status=${res.status()}`);
  }

  // 2. Booking API: empty POST must be 400 — proves the route + validation are alive.
  // NOTE: this does NOT test Supabase env (validation runs before the env check).
  // For an env probe, POST a valid payload: 503 = env unset, 200 = booking saved
  // (a real row! delete it afterwards), 500 = env set but insert failing.
  const bookingProbe = await page.evaluate(async (base) => {
    const r = await fetch(base + "/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    return r.status;
  }, BASE);
  ok("POST /api/bookings {} → 400 (route + validation alive)", bookingProbe === 400, `got ${bookingProbe}`);

  // 3. Chat API: 200 (key set) or 503 (designed fallback) both acceptable; report which
  const chatProbe = await page.evaluate(async (base) => {
    const r = await fetch(base + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
    });
    return r.status;
  }, BASE);
  ok("POST /api/chat reachable", chatProbe === 200 || chatProbe === 503, `status=${chatProbe} (${chatProbe === 503 ? "fallback mode — no ANTHROPIC_API_KEY" : "live AI"})`);

  // 4. SEO endpoints
  const sm = await page.goto(BASE + "/sitemap.xml");
  ok("sitemap.xml has city pages", sm.status() === 200 && (await sm.text()).includes("/service-areas/"));
  const rb = await page.goto(BASE + "/robots.txt");
  ok("robots.txt points at sitemap", rb.status() === 200 && (await rb.text()).includes("sitemap.xml"));

  // 5. JSON-LD parses
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const ld = await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => e.textContent));
  let ldOk = ld.length >= 2;
  try { ld.forEach((x) => JSON.parse(x)); } catch { ldOk = false; }
  ok("JSON-LD present and valid", ldOk, `${ld.length} blocks`);

  // 6. Honest screenshots (desktop full-reveal + mobile)
  await fullReveal(page);
  await page.screenshot({ path: `${SHOTS}/home-desktop-full.png`, fullPage: true });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(BASE + "/", { waitUntil: "networkidle" });
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: `${SHOTS}/home-mobile.png` });
  ok("screenshots written", fs.existsSync(`${SHOTS}/home-desktop-full.png`));

  ok("no page JS errors", jsErrors.length === 0, jsErrors.slice(0, 3).join(" | "));

  await browser.close();
  console.log(results.join("\n"));
  const fails = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(`\n${results.length - fails}/${results.length} checks passed; screenshots in ${SHOTS}`);
  process.exit(fails ? 1 : 0);
})();
