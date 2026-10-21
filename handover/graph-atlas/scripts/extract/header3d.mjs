import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs"; import http from "node:http"; import path from "node:path";
const ROOT = "/home/user/graph-atlas", NM = "/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/extract/node_modules";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = http.createServer((req, res) => { let body; const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); try { body = readFileSync(p); } catch { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(body); }).listen(8785);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [scheme, scale] of [["light", "2"], ["dark", "3.5"]]) {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 }, colorScheme: scheme })).newPage();
  await page.route(/https:\/\/(cdnjs|unpkg)[^ ]*/, r => r.fulfill({ body: readFileSync(`${NM}/d3/dist/d3.min.js`), contentType: "text/javascript" }));
  await page.goto("http://localhost:8785/compositions.html", { waitUntil: "load" }); await page.waitForTimeout(3000); await page.selectOption("#scale", scale);
  await page.evaluate(() => { const f = [...document.querySelectorAll(".frame")].find(x => x.getAttribute("aria-label") === "Application shell"); window.scrollTo(0, f.offsetTop + document.getElementById("board").getBoundingClientRect().top + scrollY - 260); });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => { const f = [...document.querySelectorAll(".frame")].find(x => x.getAttribute("aria-label") === "Application shell"); const h = f.querySelector(".fbody").shadowRoot.querySelector(".ds.side-navigation-header").getBoundingClientRect(); return [h.x, h.y, h.width, h.height]; });
  console.log(scheme, scale, r.map(Math.round));
  await page.screenshot({ path: `shots/hdr-${scheme}.png`, clip: { x: 0, y: Math.max(0, r[1] - 260), width: 1280, height: 640 } });
}
await browser.close(); srv.close();
