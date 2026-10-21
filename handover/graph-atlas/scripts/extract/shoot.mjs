import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
const ROOT = "/home/user/graph-atlas", NM = "/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/extract/node_modules";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const srv = http.createServer((req, res) => { try { const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); const b = readFileSync(p); res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(b); } catch { res.writeHead(404); res.end(); } }).listen(8765);
const CDN = { "d3/7.9.0/d3.min.js": `${NM}/d3/dist/d3.min.js`, "three.js/r128/three.min.js": `${NM}/three/build/three.min.js`, "3d-force-graph@1.73.4/dist/3d-force-graph.min.js": `${NM}/3d-force-graph/dist/3d-force-graph.min.js`, "d3-sankey/0.12.3/d3-sankey.min.js": `${NM}/d3-sankey/dist/d3-sankey.min.js` };
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"] });
const pages = ["index", "schema", "tiers", "anatomy", "anatomies", "tokens", "values", "standards", "coverage", "galaxy", "universe", "everything", "everything3d"];
const report = [];
for (const scheme of ["light", "dark"]) for (const width of (scheme === "light" ? [1280, 400] : [1280])) for (const name of pages) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); }); page.on("pageerror", e => errors.push("PAGEERROR " + e.message.slice(0, 200)));
  await page.route(/https:\/\/(cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\/.*/, async route => { const u = route.request().url(); const hit = Object.keys(CDN).find(k => u.includes(k)); if (hit) route.fulfill({ body: readFileSync(CDN[hit]), contentType: "text/javascript" }); else if (u.includes("fonts.googleapis")) route.fulfill({ body: "", contentType: "text/css" }); else route.abort(); });
  const t0 = Date.now();
  try { await page.goto(`http://localhost:8765/${name}.html`, { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(name.includes("everything") || name === "universe" ? 6000 : 1500); } catch (e) { errors.push("NAV " + e.message.slice(0, 100)); }
  if (name === "galaxy" && scheme === "light" && width === 1280) { try { const c = page.locator("#c"); const bb = await c.boundingBox(); await page.mouse.click(bb.x + bb.width * 0.62, bb.y + bb.height * 0.5); await page.waitForTimeout(400); report.push({ name: "galaxy-click", scheme, width, ms: 0, errors: [], overflow: "", height: await page.evaluate(() => document.querySelector(".side-panel.open") ? 1 : 0) }); await page.screenshot({ path: "shots/galaxy-panel.png" }); } catch (e) { errors.push("CLICK " + e.message.slice(0, 80)); } }
  if (name === "tiers" && scheme === "light" && width === 1280) { try { await page.locator(".roster .chip").first().click(); await page.waitForTimeout(300); report.push({ name: "tiers-click", scheme, width, ms: 0, errors: [], overflow: "", height: await page.evaluate(() => document.querySelector(".side-panel.open") ? 1 : 0) }); await page.screenshot({ path: "shots/tiers-panel.png" }); await page.keyboard.press("Escape"); } catch (e) { errors.push("CLICK " + e.message.slice(0, 80)); } }
  if (name === "everything" && scheme === "light" && width === 1280) { try { const c = page.locator("#c"); const bb = await c.boundingBox(); await page.mouse.click(bb.x + bb.width * 0.3, bb.y + bb.height * 0.5); await page.waitForTimeout(1500); report.push({ name: "everything-click", scheme, width, ms: 0, errors: [], overflow: "", height: await page.evaluate(() => document.querySelector(".side-panel.open") ? 1 : 0) }); await page.screenshot({ path: "shots/everything-panel.png" }); } catch (e) { errors.push("CLICK " + e.message.slice(0, 80)); } }
  const overflow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight }));
  await page.screenshot({ path: `shots/${name}-${scheme}-${width}.png`, fullPage: name !== "everything3d" && name !== "universe" && name !== "galaxy" && name !== "everything" });
  report.push({ name, scheme, width, ms: Date.now() - t0, errors, overflow: overflow.sw > overflow.cw + 1 ? `${overflow.sw}>${overflow.cw}` : "", height: overflow.h });
  await ctx.close();
}
await browser.close(); srv.close();
for (const r of report) console.log(`${r.name.padEnd(13)} ${r.scheme.padEnd(5)} ${String(r.width).padEnd(4)} ${String(r.ms).padStart(5)}ms h=${r.height} ${r.overflow ? "OVERFLOW " + r.overflow : ""} ${r.errors.length ? "ERRORS: " + r.errors.join(" | ") : ""}`);
