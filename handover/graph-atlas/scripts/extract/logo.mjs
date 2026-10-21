import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs"; import http from "node:http"; import path from "node:path";
const ROOT = "/home/user/graph-atlas", NM = "/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/extract/node_modules";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = http.createServer((req, res) => { let body; const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); try { body = readFileSync(p); } catch { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(body); }).listen(8786);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [scheme, layer, tilt] of [["light", "", false], ["light", "elements", true], ["dark", "elements", true]]) {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 }, colorScheme: scheme, deviceScaleFactor: 2 })).newPage();
  const errs = []; page.on("console", m => m.type() === "error" && errs.push(m.text())); page.on("pageerror", e => errs.push(String(e)));
  await page.route(/https:\/\/(cdnjs|unpkg)[^ ]*/, r => r.fulfill({ body: readFileSync(`${NM}/d3/dist/d3.min.js`), contentType: "text/javascript" }));
  await page.goto("http://localhost:8786/compositions.html", { waitUntil: "load" }); await page.waitForTimeout(3000);
  await page.selectOption("#layer", layer); if (!tilt) await page.click("#tilt"); await page.waitForTimeout(800);
  await page.evaluate(() => { const f = [...document.querySelectorAll(".frame")].find(x => x.getAttribute("aria-label") === "Application shell"); f.querySelector(".fbody").shadowRoot.querySelector(".ds.side-navigation-header").scrollIntoView({block:"center"}); });
  await page.waitForTimeout(1200);
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { const f = [...document.querySelectorAll(".frame")].find(x => x.getAttribute("aria-label") === "Application shell"); const y = f.querySelector(".fbody").shadowRoot.querySelector(".ds.side-navigation-header").getBoundingClientRect().y; window.scrollBy(0, y - 300); }); await page.waitForTimeout(700); }
  const r = await page.evaluate(() => { const f = [...document.querySelectorAll(".frame")].find(x => x.getAttribute("aria-label") === "Application shell"); const sr = f.querySelector(".fbody").shadowRoot;
    const q = s => { const e = sr.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const logo = sr.querySelector(".canonical-logo"); const img = sr.querySelector(".canonical-logo img");
    return { header: q(".ds.side-navigation-header"), logo: q(".canonical-logo"), mark: q(".canonical-logo .mark"), title: q(".ds.side-navigation-header .title"), bg: logo && getComputedStyle(logo).backgroundColor, loaded: img && img.complete && img.naturalWidth }; });
  const ov = r.logo && r.title && r.logo.x + r.logo.w > r.title.x;
  console.log(scheme, layer, JSON.stringify(r), "overlap:", ov, "errors:", errs.length);
  await page.screenshot({ path: `shots/logo-${scheme}-${layer||"off"}-${tilt?"tilt":"flat"}.png`, clip: { x: Math.max(0, r.header.x - 20), y: Math.max(0, r.header.y - 20), width: 360, height: 200 } });
}
await browser.close(); srv.close();
