import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs"; import http from "node:http"; import path from "node:path";
const ROOT = "/home/user/graph-atlas", NM = "/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/extract/node_modules";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const srv = http.createServer((req, res) => { try { const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(readFileSync(p)); } catch { res.writeHead(404); res.end(); } }).listen(8769);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [scheme, width] of [["light", 1280], ["dark", 1280], ["light", 400]]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme }); const page = await ctx.newPage(); const errs = [];
  page.on("pageerror", e => errs.push(e.message.slice(0, 160))); page.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
  await page.route(/https:\/\/(cdnjs|unpkg|fonts)[^ ]*/, r => { const u = r.request().url(); if (u.includes("d3/7.9.0")) r.fulfill({ body: readFileSync(`${NM}/d3/dist/d3.min.js`), contentType: "text/javascript" }); else r.fulfill({ body: "", contentType: "text/css" }); });
  await page.goto(`http://localhost:8769/board.html`, { waitUntil: "domcontentloaded", timeout: 60000 }); await page.waitForTimeout(2500);
  await page.screenshot({ path: `shots/board-${scheme}-${width}.png`, fullPage: false });
  if (scheme === "light" && width === 1280) { await page.screenshot({ path: `shots/board-full.png`, fullPage: true }); await page.click("#indexBtn", { force: true }); await page.waitForTimeout(400); await page.screenshot({ path: `shots/board-drawer.png` }); await page.click("#drawerClose", { force: true }); await page.locator(".frame .fhead").nth(3).click({ force: true }); await page.waitForTimeout(400); await page.screenshot({ path: `shots/board-panel.png` }); }
  console.log(scheme, width, "scrollWidth", await page.evaluate(() => document.documentElement.scrollWidth), "frames", await page.evaluate(() => document.querySelectorAll(".frame").length), errs);
  await ctx.close();
}
await browser.close(); srv.close();
