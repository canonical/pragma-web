import { readFileSync, writeFileSync } from "node:fs";
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide } from "d3-force";
const D = "/home/user/graph-atlas/data";
const { nodes, edges } = JSON.parse(readFileSync(`${D}/entities.json`, "utf-8"));
const nsOf = (iri) => {
  if (iri.startsWith("https://ds.canonical.com/")) return "ds";
  if (iri.startsWith("https://dt.canonical.com/w3c-tokens/")) return "w3c";
  if (iri.startsWith("https://dt.canonical.com/")) return "dt";
  if (iri.startsWith("https://anatomy.canonical.com/")) return "anatomy";
  if (iri.startsWith("http://pragma.canonical.com/")) return "cs";
  return "other";
};
const local = (iri) => iri.replace(/^https?:\/\/[^/]+\//, "").replace("w3c-tokens/", "w3c:");
const idx = new Map(nodes.map((n, i) => [n.s, i]));
// include object-only IRIs (targets never subjects) as nodes
for (const e of edges) { if (!idx.has(e.o)) { idx.set(e.o, nodes.length); nodes.push({ s: e.o, class: "", label: "", outDeg: "0" }); } }
const N = nodes.map((n, i) => ({ id: i, iri: n.s, ns: nsOf(n.s), cls: local(n.class || ""), label: n.label || "", deg: 0 }));
const L = edges.map(e => ({ source: idx.get(e.s), target: idx.get(e.o), p: local(e.p) }));
for (const l of L) { N[l.source].deg++; N[l.target].deg++; }
// cluster anchors by namespace (and class group inside dt)
const anchor = (n) => {
  if (n.ns === "ds") return [-900, 0];
  if (n.ns === "cs") return [0, 900];
  if (n.ns === "anatomy") return [-400, 700];
  if (n.ns === "w3c") return [900, -300];
  if (n.ns === "dt") return /Variable|Declaration|cond/.test(n.cls + n.iri) ? [700, 500] : [600, -100];
  return [0, -900];
};
N.forEach(n => { const [ax, ay] = anchor(n); n.x = ax + (Math.random() - 0.5) * 400; n.y = ay + (Math.random() - 0.5) * 400; });
const sim = forceSimulation(N)
  .force("link", forceLink(L).distance(14).strength(0.25))
  .force("charge", forceManyBody().strength(-9).theta(0.9).distanceMax(600))
  .force("x", forceX(n => anchor(n)[0]).strength(0.05))
  .force("y", forceY(n => anchor(n)[1]).strength(0.05))
  .force("collide", forceCollide(2.2).iterations(1))
  .stop();
const t0 = Date.now();
for (let i = 0; i < 320; i++) { sim.tick(); if (i % 40 === 0) console.log("tick", i, Date.now() - t0, "ms"); }
// normalise to [-1000,1000]
const xs = N.map(n => n.x), ys = N.map(n => n.y);
const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
const span = Math.max(maxx - minx, maxy - miny);
const out = {
  nodes: N.map(n => [+((n.x - (minx + maxx) / 2) / span * 2000).toFixed(1), +((n.y - (miny + maxy) / 2) / span * 2000).toFixed(1), n.ns, n.cls, n.deg, n.label || local(n.iri)]),
  links: L.map(l => [l.source.id, l.target.id, l.p]),
};
writeFileSync(`${D}/layout.json`, JSON.stringify(out));
console.log("nodes", out.nodes.length, "links", out.links.length, "bytes", JSON.stringify(out).length, Date.now() - t0, "ms");
const byNs = {}; N.forEach(n => byNs[n.ns] = (byNs[n.ns] || 0) + 1); console.log(byNs);
const byCls = {}; N.forEach(n => byCls[n.ns + ":" + n.cls] = (byCls[n.ns + ":" + n.cls] || 0) + 1); console.log(Object.entries(byCls).sort((a, b) => b[1] - a[1]).slice(0, 30));
