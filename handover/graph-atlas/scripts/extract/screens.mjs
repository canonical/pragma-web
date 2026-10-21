import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs"; import http from "node:http"; import path from "node:path";
const ROOT = "/home/user/graph-atlas", NM = "/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/extract/node_modules";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = http.createServer((req, res) => { let body; const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); try { body = readFileSync(p); } catch { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(body); }).listen(8779);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const scheme of ["light", "dark"]) {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 }, colorScheme: scheme })).newPage(); const errs = []; page.on("pageerror", e => errs.push(e.message)); page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await page.route(/https:\/\/(cdnjs|unpkg)[^ ]*/, r => r.fulfill({ body: readFileSync(`${NM}/d3/dist/d3.min.js`), contentType: "text/javascript" }));
  await page.goto("http://localhost:8779/compositions.html", { waitUntil: "load" }); await page.waitForTimeout(2800);
  if (scheme === "light") { await page.click("#tilt", { force: true }); await page.waitForTimeout(900);
    const over = await page.evaluate(() => [...document.querySelectorAll(".frame")].map(f => { const sr = f.querySelector(".fbody").shadowRoot; const surf = sr.querySelector(".surface"); const host = f.querySelector(".fbody"); let maxB = 0; for (const el of sr.querySelectorAll(".surface *")) { const r = el.getBoundingClientRect(); if (r.height) maxB = Math.max(maxB, r.bottom); } const hb = host.getBoundingClientRect().bottom; return [f.getAttribute("aria-label"), Math.round(maxB - hb)]; }).filter(x => x[1] > 2));
    console.log("content overflowing its frame:", JSON.stringify(over));
    const ov = await page.evaluate(() => { const fr = [...document.querySelectorAll(".frame")].map(f => [f.getAttribute("aria-label"), f.getBoundingClientRect()]); const hits = []; for (let i = 0; i < fr.length; i++) for (let j = i + 1; j < fr.length; j++) { const a = fr[i][1], b = fr[j][1]; if (a.left < b.right - 2 && b.left < a.right - 2 && a.top < b.bottom - 2 && b.top < a.bottom - 2) hits.push(fr[i][0] + " × " + fr[j][0]); } return hits; });
    console.log("overlapping frames:", JSON.stringify(ov)); }
  const box = await page.evaluate(() => { const fs = [...document.querySelectorAll(".frame")].filter(f => ["Application shell", "Side panel", "Modal"].includes(f.getAttribute("aria-label"))); fs[0].scrollIntoView({ block: "start" }); const rs = fs.map(f => f.getBoundingClientRect()); return [Math.min(...rs.map(r => r.left)), Math.min(...rs.map(r => r.top)), Math.max(...rs.map(r => r.right)), Math.max(...rs.map(r => r.bottom))]; });
  await page.waitForTimeout(600);
  const b2 = await page.evaluate(() => { const fs = [...document.querySelectorAll(".frame")].filter(f => ["Application shell", "Side panel", "Modal"].includes(f.getAttribute("aria-label"))); const rs = fs.map(f => f.getBoundingClientRect()); return [Math.max(0, Math.min(...rs.map(r => r.left)) - 20), Math.max(0, Math.min(...rs.map(r => r.top)) - 20)]; });
  await page.setViewportSize({ width: 1280, height: 1900 }); await page.waitForTimeout(500);
  await page.screenshot({ path: `shots/screens-${scheme}.png`, clip: { x: 0, y: Math.max(0, b2[1]), width: 1280, height: 1880 } });
  console.log(scheme, "errors", errs);
}
await browser.close(); srv.close();
