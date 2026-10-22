/* Shared helpers for every Atlas page. Loaded after d3. */
window.Atlas = (() => {
  const PAGES = [
    ["index.html", "Overview"],
    ["schema.html", "Schema"],
    ["tiers.html", "Tiers & blocks"],
    ["anatomy.html", "Anatomy & bindings"],
    ["anatomies.html", "Anatomy census"],
    ["tokens.html", "Token pipeline"],
    ["values.html", "Token values"],
    ["standards.html", "Standards"],
    ["coverage.html", "Coverage"],
    ["galaxy.html", "Entities (2D)"],
    ["universe.html", "Entities (3D)"],
    ["everything.html", "Everything (2D)"],
    ["everything3d.html", "Everything (3D)"],
    ["city.html", "City (isometric)"],
    ["board.html", "Board (real components)"],
    ["compositions.html", "Compositions (real components)"],
  ];
  const SNAPSHOT = { version: "0.43.0", created: "2026-09-30", hash: "e63e7a6e", triples: 65298, entities: 4377 };

  function mountNav(current) {
    const el = document.querySelector(".masthead .wrap");
    if (!el) return;
    el.innerHTML = `<a class="brand" href="index.html">Pragma Graph Atlas<small>v${SNAPSHOT.version}</small></a><nav class="atlas" aria-label="Views"></nav>`;
    const nav = el.querySelector("nav");
    for (const [href, label] of PAGES) {
      const a = document.createElement("a"); a.href = href; a.textContent = label;
      if (href === current) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    }
    const f = document.querySelector("footer.colophon");
    if (f && !f.innerHTML.trim()) f.innerHTML = `<div>Source: the embedded snapshot shipped with <code>@canonical/pragma-cli</code> ${SNAPSHOT.version}, built ${SNAPSHOT.created} from @canonical/design-system, anatomy-dsl, token-ontology, code-standards (all 0.43.0) and ds-implementations (git 3828317). Content hash ${SNAPSHOT.hash}…</div><div>Every number on this page is the result of a SPARQL query run with <code>pragma graph query</code>; the colours and type are the design tokens the graph itself resolves (see Token values).</div>`;
  }

  const fmt = d3.format(",");
  const pct = d3.format(".1%");
  const PREFIX = [
    ["https://dt.canonical.com/w3c-tokens/", "w3c-tokens:"],
    ["https://dt.canonical.com/platform/web/", "dt-web:"],
    ["https://dt.canonical.com/", "dt:"],
    ["https://ds.canonical.com/", "ds:"],
    ["https://anatomy.canonical.com/", "anatomy:"],
    ["http://pragma.canonical.com/codestandards#", "cs:"],
    ["http://www.w3.org/1999/02/22-rdf-syntax-ns#", "rdf:"],
    ["http://www.w3.org/2000/01/rdf-schema#", "rdfs:"],
    ["http://www.w3.org/2002/07/owl#", "owl:"],
    ["http://www.w3.org/2001/XMLSchema#", "xsd:"],
    ["http://www.w3.org/2004/02/skos/core#", "skos:"],
    ["http://www.w3.org/ns/shacl#", "sh:"],
    ["http://purl.org/dc/terms/", "dcterms:"],
  ];
  function curie(iri) { if (!iri) return ""; for (const [p, c] of PREFIX) if (iri.startsWith(p)) return c + iri.slice(p.length); return iri; }
  function local(iri) { const c = curie(iri); return c.slice(c.indexOf(":") + 1); }
  function nsOf(iri) {
    if (!iri) return "schema";
    if (iri.startsWith("https://ds.canonical.com/")) return "ds";
    if (iri.startsWith("https://dt.canonical.com/")) return "dt";
    if (iri.startsWith("http://pragma.canonical.com/")) return "cs";
    if (iri.startsWith("https://anatomy.canonical.com/")) return "anatomy";
    return "schema";
  }
  const NS_LABEL = { ds: "ds: design system", dt: "dt: design tokens", cs: "cs: code standards", anatomy: "anatomy: anatomy DSL", schema: "rdf / rdfs / owl / shacl / skos" };
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const nsColor = (ns) => `var(--ns-${ns})`;
  // Resolve a CSS colour expression (custom property, light-dark(), …) to the rgb() the current theme computes.
  let probe;
  function resolve(expr) {
    if (!probe) { probe = document.createElement("span"); probe.style.cssText = "position:absolute;left:-9999px;top:-9999px"; document.body.appendChild(probe); }
    probe.style.color = ""; probe.style.color = expr;
    return getComputedStyle(probe).color;
  }
  const series = (i) => `var(--series-${i})`;

  async function load(...names) {
    const out = await Promise.all(names.map(n => fetch(`data/${n}.json`).then(r => { if (!r.ok) throw new Error(`${n}: ${r.status}`); return r.json(); })));
    return names.length === 1 ? out[0] : out;
  }

  // Tooltip (fixed; follows pointer; clamps to viewport)
  let tipEl;
  function tip(html, ev) {
    if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "tip"; document.body.appendChild(tipEl); }
    if (!html) { tipEl.classList.remove("show"); return; }
    tipEl.innerHTML = html; tipEl.classList.add("show");
    const pad = 12, w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + w > innerWidth - 8) x = ev.clientX - w - pad;
    if (y + h > innerHeight - 8) y = ev.clientY - h - pad;
    tipEl.style.left = x + "px"; tipEl.style.top = y + "px";
  }

  function legend(container, items) {
    const el = typeof container === "string" ? document.querySelector(container) : container;
    el.classList.add("legend");
    el.innerHTML = items.map(it => `<span class="key"><span class="swatch ${it.shape || ""}" style="background:${it.color};${it.shape === 'ring' ? `color:${it.color}` : ''}"></span>${it.label}${it.count != null ? ` <span class="count">${fmt(it.count)}</span>` : ""}</span>`).join("");
  }

  function table(container, columns, rows, opts = {}) {
    const el = typeof container === "string" ? document.querySelector(container) : container;
    const th = columns.map(c => `<th class="${c.num ? "num" : ""}">${c.label}</th>`).join("");
    const body = rows.map(r => `<tr>${columns.map(c => `<td class="${c.num ? "num" : ""}">${c.render ? c.render(r) : (c.num ? fmt(+r[c.key]) : (r[c.key] ?? ""))}</td>`).join("")}</tr>`).join("");
    el.innerHTML = `<div class="table-wrap"><table class="data"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  // Horizontal bar chart: rows = [{label, value, color?, sub?}], one scale, labels at the tip.
  function hbars(container, rows, opts = {}) {
    const el = typeof container === "string" ? document.querySelector(container) : container;
    const rowH = opts.rowH || 22, labelW = opts.labelW || 220, valueW = 64, W = opts.width || 900, H = rows.length * rowH + 8;
    const max = opts.max || d3.max(rows, r => r.value);
    const x = d3.scaleLinear().domain([0, max]).range([0, W - labelW - valueW - 8]);
    const svg = d3.create("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("role", "img").attr("aria-label", opts.aria || "bar chart");
    const g = svg.append("g").attr("transform", `translate(${labelW},4)`);
    const ticks = x.ticks(4);
    const grid = g.append("g").attr("class", "grid");
    grid.selectAll("line").data(ticks).join("line").attr("x1", d => x(d)).attr("x2", d => x(d)).attr("y1", 0).attr("y2", rows.length * rowH);
    const r = g.selectAll("g.row").data(rows).join("g").attr("class", "row").attr("transform", (d, i) => `translate(0,${i * rowH})`);
    r.append("rect").attr("x", 0).attr("y", 4).attr("height", Math.min(rowH - 8, 16)).attr("width", d => Math.max(0, x(d.value))).attr("fill", d => d.color || series(1));
    r.append("text").attr("x", -8).attr("y", rowH / 2).attr("dy", ".32em").attr("text-anchor", "end").attr("font-size", 12).text(d => d.label);
    r.append("text").attr("x", d => x(d.value) + 6).attr("y", rowH / 2).attr("dy", ".32em").attr("font-size", 12).attr("class", "tabular").text(d => opts.format ? opts.format(d.value) : fmt(d.value));
    if (opts.sub) r.append("text").attr("x", -8).attr("y", rowH / 2).attr("dy", "1.5em").attr("text-anchor", "end").attr("font-size", 10).attr("class", "muted").text(d => d.sub || "");
    r.on("pointermove", (ev, d) => tip(d.tip || `<b>${d.label}</b><br>${fmt(d.value)}`, ev)).on("pointerleave", () => tip(null));
    el.replaceChildren(svg.node());
  }

  // Side panel for node details. show(title, kicker, bodyHtml); hide().
  let panelEl;
  function panel() {
    if (panelEl) return panelEl;
    panelEl = document.createElement("aside"); panelEl.className = "side-panel"; panelEl.setAttribute("aria-live", "polite");
    panelEl.innerHTML = `<header><div><div class="kicker"></div><h3></h3></div><button class="close" aria-label="Close details">×</button></header><div class="body"></div>`;
    panelEl.querySelector("button.close").addEventListener("click", hidePanel);
    document.addEventListener("keydown", e => { if (e.key === "Escape") hidePanel(); });
    document.body.appendChild(panelEl); return panelEl;
  }
  function showPanel(title, kicker, html) { const p = panel(); p.querySelector("h3").textContent = title; p.querySelector(".kicker").textContent = kicker || ""; p.querySelector(".body").innerHTML = html; p.classList.add("open"); p.querySelector(".body").scrollTop = 0; return p; }
  function hidePanel() { if (panelEl) panelEl.classList.remove("open"); if (typeof window.onPanelClose === "function") window.onPanelClose(); }
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function cmd(text) { return `<h4>Ask pragma</h4><pre class="cmd">${esc(text)}</pre>`; }

  // A Shadow DOM island: the component markup lives in its own tree with only pragma's stylesheet
  // (pragma-island.css: pragma.css with :root retargeted to :host and html/body to .island), inside the
  // same root structure Storybook gives a story: `comfortable app` around a `div.surface`.
  const ISLAND_CSS = `@layer helpers {
  .stack-v{display:grid;gap:var(--dimension-200,1rem)} .titlebar{display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap}
  .actions{display:flex;gap:var(--dimension-100,.5rem);align-items:center;flex-wrap:wrap;margin-top:var(--dimension-200,1rem)} .row{display:flex;gap:var(--dimension-100,.5rem);align-items:center;flex-wrap:wrap}
  .row.icons{gap:.75rem} .row.icons svg{width:1.25rem;height:1.25rem}
  .tiles-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:var(--dimension-200,1rem)} .cards-2{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:var(--dimension-200,1rem)}
  .big{font-size:1.75rem;font-weight:300;line-height:1.1;margin-right:.25rem} .h2{display:flex;gap:.5rem;align-items:center} .muted{color:var(--color-text-muted)} .small{font-size:.8125rem}
  dl.keys{display:grid;grid-template-columns:1fr auto;gap:.5rem 1.5rem;margin:0;align-items:center} dl.keys dt,dl.keys dd{margin:0}
  .brand-mark{display:block;width:1.75rem;height:1.75rem;background:#e95420}
  .tiles-3.narrow{grid-template-columns:repeat(3,minmax(0,1fr))} .big{margin:0} .tile p, .ds.tile-content p{margin:0}
  .screen-main{padding:var(--dimension-300,1.5rem) var(--dimension-300,1.5rem) var(--dimension-300,1.5rem) 0}
  .screen-backdrop{padding:var(--dimension-300,1.5rem)} .screen-scrim{position:absolute;inset:0;background:var(--color-backdrop,rgba(0,0,0,.15))}
}
:host { display: block; }
.island { display: block; }
.surface.screen { position: relative; block-size: var(--screen); contain: layout; }
.surface.screen > dialog[open].ds.modal { position: absolute; inset: 0; margin: auto; block-size: fit-content; }
.surface.screen > dialog[open].ds.side-panel { position: absolute; inset-block: 0; inset-inline-end: 0; inset-inline-start: auto; margin: 0; block-size: 100%; }
.island[data-layer] .surface, .island[data-layer] .surface * { transform-style: preserve-3d; }
/* pragma clips these with overflow: hidden (auto on modal content), which flattens their 3D descendants into
   one plane; clip keeps the clipping and lets the layers through. No composition's modal is tall enough to scroll. */
.island[data-layer] .surface :is(.ds.card, .ds.tile, .ds.accordion, .ds.modal, .ds.side-navigation .ds.content) { overflow: clip; }
.island[data-layer] .surface .ds.modal-content { overflow: visible; }
.island[data-layer="elements"] .surface * { translate: 0 0 var(--dz2, 2px); }
.island[data-layer="components"] .surface .ds { translate: 0 0 var(--dz2, 2px); }
/* an overlay floats above the page it covers, whatever that page's depth */
.island[data-layer] .surface.screen > .screen-scrim { translate: 0 0 calc(var(--dz2, 2px) * 5); }
.island[data-layer] .surface.screen > dialog[open] { translate: 0 0 calc(var(--dz2, 2px) * 6); }`;
  function island(host, html, opts = {}) {
    const sr = host.shadowRoot || host.attachShadow({ mode: "open" });
    const cls = ["island", "comfortable", opts.context || "app", opts.scheme || ""].filter(Boolean).join(" ");
    sr.innerHTML = `<style>@layer helpers;</style><link rel="stylesheet" href="pragma-island.css"><style>${ISLAND_CSS}</style><div class="${cls}"${opts.layer ? ` data-layer="${opts.layer}"` : ""}><div class="surface${opts.screen ? " screen" : ""}"${opts.screen ? ` style="--screen:${opts.screen}px"` : ""}>${html}</div></div>`;
    const link = sr.querySelector("link");
    return new Promise(res => { const done = () => res(sr); if (link.sheet) done(); else { link.addEventListener("load", done, { once: true }); link.addEventListener("error", done, { once: true }); } });
  }
  const islandRoot = (sr) => sr.querySelector(".island");
  function islandSet(sr, { context, scheme, layer, dz2 } = {}) {
    const el = islandRoot(sr);
    if (context) { el.classList.remove("app", "site", "docs"); el.classList.add(context); }
    if (scheme !== undefined) { el.classList.remove("light", "dark"); if (scheme) el.classList.add(scheme); }
    if (layer !== undefined) { if (layer) el.dataset.layer = layer; else delete el.dataset.layer; }
    if (dz2 !== undefined) el.style.setProperty("--dz2", dz2);
  }
  // Max HTML nesting depth below the island's surface (the component root's parent).
  function depthOf(sr) { let max = 0; (function walk(el, d) { for (const ch of el.children) { if (d > max) max = d; walk(ch, d + 1); } })(sr.querySelector(".surface"), 1); return max; }

  // Pack frames into a gapless board. Each frame carries data-span (preferred), data-min and data-max
  // column spans. Placement always fills the lowest open segment of the skyline, preferring a frame and span
  // that match the segment's width exactly (looking a few frames ahead, so order is kept where it costs
  // nothing). A segment nothing fits is raised to its lower neighbour. Then frames grow sideways into empty
  // strips beside them, and finally stretch down to whatever is below them, so the board has no holes.
  function packBoard(board, frames, { minCol = 170, gap = 32, lookahead = 5 } = {}) {
    const W = board.clientWidth; if (!W) return;
    const n = Math.max(1, Math.floor((W + gap) / (minCol + gap))); const colW = (W - gap * (n - 1)) / n;
    const spanW = (k) => k * colW + (k - 1) * gap;
    board.style.position = "relative";
    const items = frames.map((el, order) => { el.style.position = "absolute"; el.style.height = ""; el.style.gridColumn = ""; el.style.gridRow = "";
      const pref = Math.min(n, +el.dataset.span || 1), min = Math.min(n, +el.dataset.min || Math.max(1, pref - 1)), max = Math.min(n, Math.max(pref, +el.dataset.max || pref + 1));
      return { el, order, pref, min: Math.min(min, pref), max, h: {} }; });
    const heightAt = (it, k) => { if (it.h[k] == null) { it.el.style.width = spanW(k) + "px"; it.h[k] = it.el.offsetHeight; } return it.h[k]; };
    const colH = new Array(n).fill(0), placed = [], queue = items.slice();
    let guard = 0;
    while (queue.length && guard++ < 2000) {
      const ymin = Math.min(...colH); const x0 = colH.indexOf(ymin); let x1 = x0; while (x1 + 1 < n && colH[x1 + 1] === ymin) x1++;
      const segW = x1 - x0 + 1;
      let best = null; const minLeft = (skip) => Math.min(...queue.filter(q => q !== skip).map(q => q.min), Infinity);
      for (let qi = 0; qi < Math.min(lookahead, queue.length); qi++) { const it = queue[qi]; const ml = minLeft(it);
        for (let k = Math.min(it.max, segW); k >= it.min; k--) {
          const rest = segW - k; // a leftover strip nothing can fill becomes a stretch later; penalise it
          const score = Math.abs(k - it.pref) * 3 + qi * 2 + (rest > 0 && rest < ml ? 4 : 0);
          if (!best || score < best.score) best = { it, qi, k, score };
        } }
      if (!best) { // nothing fits: raise the segment to its lower neighbour (the frames above it stretch later)
        const left = x0 > 0 ? colH[x0 - 1] : Infinity, right = x1 < n - 1 ? colH[x1 + 1] : Infinity; const to = Math.min(left, right);
        if (to === Infinity) { // the whole row is one segment narrower than every frame's minimum: place the next frame at its minimum
          const it = queue[0]; const k = Math.min(n, it.min); const h = heightAt(it, k); it.x = 0; it.k = k; it.y = ymin; it.hh = h; placed.push(it); queue.shift(); for (let c = 0; c < k; c++) colH[c] = ymin + h + gap; continue; }
        for (let c = x0; c <= x1; c++) colH[c] = to; continue; }
      const { it, qi, k } = best; const h = heightAt(it, k);
      it.x = x0; it.k = k; it.y = ymin; it.hh = h; placed.push(it); queue.splice(qi, 1);
      for (let c = x0; c < x0 + k; c++) colH[c] = ymin + h + gap;
    }
    const bottom = Math.max(...colH) - gap;
    const overlaps = (a, x, k, y0, y1) => placed.some(b => b !== a && b.x < x + k && x < b.x + b.k && b.y < y1 && y0 < b.y + b.hh);
    // grow sideways into empty strips (one column at a time, both directions)
    for (let pass = 0; pass < 3; pass++) for (const a of placed) {
      while (a.x + a.k < n && !overlaps(a, a.x + a.k, 1, a.y, a.y + a.hh + gap)) a.k++;
      while (a.x > 0 && !overlaps(a, a.x - 1, 1, a.y, a.y + a.hh + gap)) { a.x--; a.k++; }
    }
    // stretch down to the next frame below, or to the board's bottom
    for (const a of placed) { let next = bottom + gap;
      for (const b of placed) if (b !== a && b.y >= a.y + a.hh && b.x < a.x + a.k && a.x < b.x + b.k) next = Math.min(next, b.y);
      a.hh = next - gap - a.y; }
    for (const a of placed) { a.el.style.left = (a.x * (colW + gap)) + "px"; a.el.style.top = a.y + "px"; a.el.style.width = spanW(a.k) + "px"; a.el.style.height = a.hh + "px"; }
    board.style.height = bottom + "px";
    return { columns: n, placed: placed.map(p => ({ i: p.order, x: p.x, k: p.k })) };
  }

  return { PAGES, SNAPSHOT, mountNav, showPanel, hidePanel, esc, cmd, island, islandSet, depthOf, packBoard, fmt, pct, curie, local, nsOf, NS_LABEL, nsColor, resolve, series, css, load, tip, legend, table, hbars };
})();
