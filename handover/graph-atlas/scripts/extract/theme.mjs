import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs"; import http from "node:http"; import path from "node:path";
const ROOT = "/home/user/graph-atlas", NM = "/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/extract/node_modules";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = http.createServer((req, res) => { let body; const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); try { body = readFileSync(p); } catch { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(body); }).listen(8787);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const pages = process.argv[2] ? process.argv[2].split(",") : ["compositions.html", "board.html"];
for (const pg of pages) for (const os of ["light", "dark"]) for (const pick of ["", "light", "dark"]) {
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: os })).newPage();
  await page.route(/https:\/\/(cdnjs|unpkg)[^ ]*/, r => r.fulfill({ body: readFileSync(`${NM}/d3/dist/d3.min.js`), contentType: "text/javascript" }));
  await page.goto("http://localhost:8787/" + pg, { waitUntil: "load" }); await page.waitForTimeout(2500);
  const has = await page.$("#theme"); if (has) await page.selectOption("#theme", pick); await page.waitForTimeout(500);
  const r = await page.evaluate(() => { const b = getComputedStyle(document.body).backgroundColor; const f = document.querySelector(".fbody"); const sr = f && f.shadowRoot; const s = sr && sr.querySelector(".surface"); const isl = sr && sr.querySelector(".island");
    return { root: document.documentElement.className + "|" + (document.documentElement.dataset.theme||""), body: b, island: isl && isl.className, surfaceBg: s && getComputedStyle(s).backgroundColor, text: s && getComputedStyle(s).color, cs: isl && getComputedStyle(isl).colorScheme }; });
  console.log(pg, "os=" + os, "pick=" + (pick || "follow"), JSON.stringify(r));
  await page.screenshot({ path: `shots/theme-${pg}-${os}-${pick || "follow"}.png` });
}
await browser.close(); srv.close();
