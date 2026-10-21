import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs"; import http from "node:http"; import path from "node:path";
const ROOT = "/home/user/graph-atlas", NM = "/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/extract/node_modules";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = http.createServer((req, res) => { let body; const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); try { body = readFileSync(p); } catch { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(body); }).listen(8787);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const file of ["compositions.html", "board.html"]) {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
  await page.route(/https:\/\/(cdnjs|unpkg)[^ ]*/, r => r.fulfill({ body: readFileSync(`${NM}/d3/dist/d3.min.js`), contentType: "text/javascript" }));
  await page.goto(`http://localhost:8787/${file}`, { waitUntil: "load" }); await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollTo(0, document.getElementById("stage").getBoundingClientRect().top + scrollY + 200)); await page.waitForTimeout(900);
  // a real pointer click on empty frame padding: find a point inside a frame that hits the frame itself
  const pt = await page.evaluate(() => { for (const f of document.querySelectorAll(".frame")) { const r = f.getBoundingClientRect(); if (r.top < 100 || r.bottom > innerHeight - 50) continue; for (const [dx, dy] of [[r.width / 2, r.height - 8], [8, r.height / 2], [r.width - 8, r.height / 2]]) { const x = r.left + dx, y = r.top + dy; const el = document.elementFromPoint(x, y); if (el === f || (el && el.closest && el.closest(".frame") === f && !el.matches("a,button,input,select,textarea"))) return { x, y, label: f.getAttribute("aria-label") }; } } return null; });
  if (pt) await page.mouse.click(pt.x, pt.y); await page.waitForTimeout(500);
  const open = await page.evaluate(() => { const p = document.querySelector(".side-panel.open"); return p ? p.querySelector("h3").textContent : null; });
  console.log(file, "clicked", pt && pt.label, "-> panel:", open);
  if (file === "compositions.html") await page.screenshot({ path: "shots/c-panel.png" });
}
await browser.close(); srv.close();
