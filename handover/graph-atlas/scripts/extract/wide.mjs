import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs"; import http from "node:http"; import path from "node:path";
const ROOT = "/home/user/graph-atlas", NM = "/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/extract/node_modules";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const srv = http.createServer((req, res) => { try { const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(readFileSync(p)); } catch { res.writeHead(404); res.end(); } }).listen(8766);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const name of ["index", "schema", "tiers", "anatomy", "anatomies", "tokens", "values", "standards", "coverage", "galaxy", "universe", "everything", "everything3d"]) {
  const ctx = await browser.newContext({ viewport: { width: 400, height: 900 } }); const page = await ctx.newPage(); const errs = [];
  page.on("pageerror", e => errs.push(e.message.slice(0, 120)));
  await page.route(/https:\/\/(cdnjs|unpkg|fonts)[^ ]*/, r => { const u = r.request().url(); if (u.includes("d3/7.9.0")) r.fulfill({ body: readFileSync(`${NM}/d3/dist/d3.min.js`), contentType: "text/javascript" }); else if (u.includes("d3-sankey")) r.fulfill({ body: readFileSync(`${NM}/d3-sankey/dist/d3-sankey.min.js`), contentType: "text/javascript" }); else r.fulfill({ body: "", contentType: "text/css" }); });
  await page.goto(`http://localhost:8766/${name}.html`, { waitUntil: "load" }); await page.waitForTimeout(1500);
  const wide = await page.evaluate(() => { const out = []; const vw = document.documentElement.clientWidth; for (const el of document.querySelectorAll("body *")) { const r = el.getBoundingClientRect(); if (r.right > vw + 2 && r.width > 0) out.push(`${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.className && typeof el.className === "string" ? "." + el.className.split(" ").slice(0, 2).join(".") : ""} right=${Math.round(r.right)} w=${Math.round(r.width)}`); } return out.slice(0, 12); });
  console.log(name, "scrollWidth", await page.evaluate(() => document.documentElement.scrollWidth), errs, "\n  " + wide.join("\n  ")); await ctx.close();
}
await browser.close(); srv.close();
