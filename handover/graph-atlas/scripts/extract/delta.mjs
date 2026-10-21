import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs"; import http from "node:http"; import path from "node:path";
const ROOT = "/home/user/graph-atlas", NM = "/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/extract/node_modules";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = http.createServer((req, res) => { let body; const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); try { body = readFileSync(p); } catch { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(body); }).listen(8788);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [os, pick, host] of [["dark","light",null],["light","dark",null],["dark","",null],["dark","","light"],["light","","dark"],["light","light","dark"]]) {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: os })).newPage();
  const errs=[]; page.on("pageerror", e => errs.push(String(e)));
  await page.route(/https:\/\/(cdnjs|unpkg)[^ ]*/, r => r.fulfill({ body: readFileSync(`${NM}/d3/dist/d3.min.js`), contentType: "text/javascript" }));
  await page.goto("http://localhost:8788/compositions.html", { waitUntil: "load" }); await page.waitForTimeout(2500);
  if (host) await page.evaluate(h => document.documentElement.dataset.theme = h, host);
  await page.selectOption("#theme", pick); await page.waitForTimeout(400);
  const r = await page.evaluate(() => { const sr = document.querySelector(".fbody").shadowRoot; const isl = sr.querySelector(".island"); const cs = getComputedStyle(isl);
    return { body: getComputedStyle(document.body).backgroundColor, islandCS: cs.colorScheme, text: cs.color, delta: cs.getPropertyValue("--delta-hover-color-foreground-secondary").trim() }; });
  console.log(`os=${os} host=${host} pick=${pick||"follow"}`, JSON.stringify(r), errs.length ? errs : "");
}
await browser.close(); srv.close();
