import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs"; import http from "node:http"; import path from "node:path";
const ROOT = "/home/user/graph-atlas", NM = "/tmp/claude-0/-home-user/06a72397-f574-54f4-af6d-d59fdfba2a1a/scratchpad/extract/node_modules";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const srv = http.createServer((req, res) => { let body; const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); try { body = readFileSync(p); } catch { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(body); }).listen(8783);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [file, scheme, width] of [["compositions.html", "light", 1280], ["compositions.html", "dark", 1280], ["compositions.html", "light", 1600], ["compositions.html", "light", 400], ["board.html", "light", 1280], ["board.html", "light", 400]]) {
  const page = await (await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: scheme })).newPage(); const errs = []; page.on("pageerror", e => errs.push(e.message.slice(0, 140))); page.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 140)); });
  await page.route(/https:\/\/(cdnjs|unpkg)[^ ]*/, r => r.fulfill({ body: readFileSync(`${NM}/d3/dist/d3.min.js`), contentType: "text/javascript" }));
  await page.goto(`http://localhost:8783/${file}`, { waitUntil: "load" }); await page.waitForTimeout(3000);
  // layout boxes (untransformed) from inline styles; measure holes and overlaps in layout space
  const m = await page.evaluate(() => { const b = document.getElementById("board"); const W = b.clientWidth, H = b.offsetHeight; const fr = [...b.querySelectorAll(".frame")].map(f => ({ l: f.offsetLeft, t: f.offsetTop, w: f.offsetWidth, h: f.offsetHeight, name: f.getAttribute("aria-label") }));
    let covered = 0; const step = 8; let cells = 0; for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) { cells++; if (fr.some(f => x >= f.l - 16 && x < f.l + f.w + 16 && y >= f.t - 16 && y < f.t + f.h + 16)) covered++; }
    let ov = []; for (let i = 0; i < fr.length; i++) for (let j = i + 1; j < fr.length; j++) { const a = fr[i], c = fr[j]; if (a.l < c.l + c.w && c.l < a.l + a.w && a.t < c.t + c.h && c.t < a.t + a.h) ov.push(a.name + "×" + c.name); }
    const over = fr.filter(f => { const el = [...b.querySelectorAll(".frame")].find(x => x.getAttribute("aria-label") === f.name); return el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2; }).map(f => f.name);
    return { cols: Math.round(W), H, frames: fr.length, coverage: (covered / cells * 100).toFixed(1) + "%", overlaps: ov, clipped: over }; });
  console.log(file.padEnd(18), scheme, width, JSON.stringify(m), "sw", await page.evaluate(() => document.documentElement.scrollWidth), errs.length ? errs : "");
  if (width === 1280 && scheme === "light") { await page.click("#tilt", { force: true }); await page.waitForTimeout(800); const y = await page.evaluate(() => document.getElementById("stage").getBoundingClientRect().top + scrollY); await page.setViewportSize({ width, height: 2600 }); await page.evaluate(y => scrollTo(0, y - 10), y); await page.waitForTimeout(500); await page.screenshot({ path: `shots/pack-${file.replace(".html", "")}.png` }); }
  if (file === "compositions.html" && width === 1280) { await page.setViewportSize({ width, height: 1000 }); if (scheme === "light") await page.click("#tilt", { force: true }); await page.selectOption("#scale", "2"); await page.waitForTimeout(500);
    await page.evaluate(() => [...document.querySelectorAll(".frame")].find(x => x.getAttribute("aria-label") === "Application shell").scrollIntoView({ block: "center" })); await page.waitForTimeout(700);
    const r = await page.evaluate(() => { const f = [...document.querySelectorAll(".frame")].find(x => x.getAttribute("aria-label") === "Application shell").getBoundingClientRect(); return [f.x, f.y, f.width]; });
    await page.screenshot({ path: `shots/pack-shell-${scheme}.png`, clip: { x: Math.max(0, r[0] - 30), y: Math.max(0, r[1] - 30), width: Math.min(1250, r[2] + 60), height: 420 } }); }
}
await browser.close(); srv.close();
