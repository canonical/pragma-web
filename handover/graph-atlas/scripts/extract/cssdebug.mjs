import pw from "/opt/node-tools/node_modules/playwright/index.js"; const { chromium } = pw;
import { readFileSync } from "node:fs"; import http from "node:http"; import path from "node:path";
const ROOT = "/home/user/graph-atlas";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const srv = http.createServer((req, res) => { let body; const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); try { body = readFileSync(p); } catch { res.writeHead(404); res.end(); return; } res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }); res.end(body); }).listen(8775);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await page.goto("http://localhost:8775/ref.html", { waitUntil: "load" }); await page.waitForTimeout(800);
const out = await page.evaluate(() => {
  const sheet = [...document.styleSheets].find(s => (s.href || "").includes("pragma.css"));
  const layers = []; let total = 0;
  const walk = (rules, ctx) => { for (const r of rules) { total++; if (r instanceof CSSLayerBlockRule) { layers.push(r.name + ":" + r.cssRules.length); walk(r.cssRules, ctx + "/" + r.name); } else if (r.cssRules && !(r instanceof CSSStyleRule)) walk(r.cssRules, ctx); } };
  walk(sheet.cssRules, "");
  // which rules match the button and set font-family?
  const btn = document.querySelector("#r-button .ds.button"); const inp = document.querySelector("#r-form input[name=name]");
  const hits = (el) => { const res = []; const w = (rules, ctx) => { for (const r of rules) { if (r instanceof CSSStyleRule) { let m = false; try { m = el.matches(r.selectorText); } catch {} if (m && /font|border-width|width|height/.test(r.style.cssText)) res.push(ctx + " | " + r.selectorText.slice(0, 80) + " | " + r.style.cssText.slice(0, 140)); if (r.cssRules?.length) w(r.cssRules, ctx); } else if (r.cssRules) w(r.cssRules, ctx + "/" + (r.name || r.conditionText || r.constructor.name)); } }; w(sheet.cssRules, ""); return res; };
  const lt = document.querySelector("html"); 
  return { total, top: sheet.cssRules.length, layers: layers.slice(0, 40), btnFont: getComputedStyle(btn).fontFamily + " " + getComputedStyle(btn).fontSize, btnHits: hits(btn).slice(0, 14), inpHits: hits(inp).slice(0, 14), firstRules: [...sheet.cssRules].slice(0, 6).map(r => r.cssText.slice(0, 90)) };
});
console.log(JSON.stringify(out, null, 1));
await browser.close(); srv.close();
