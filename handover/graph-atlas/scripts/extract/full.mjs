import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { forceSimulation, forceLink, forceManyBody, forceX, forceY, forceCollide } from "d3-force";
import * as F3 from "d3-force-3d";
const D = "/home/user/graph-atlas/data";
const t0 = Date.now();
const r = spawnSync("/root/.local/bin/pragma", ["graph", "query", "SELECT ?s ?p ?o WHERE { ?s ?p ?o }", "--format", "json"], { encoding: "utf-8", maxBuffer: 1 << 30, cwd: "/home/user" });
const j = JSON.parse(r.stdout); const tb = j.data.termBindings; console.log("triples", tb.length, Date.now() - t0, "ms");
const nsOf = (iri) => iri.startsWith("https://ds.canonical.com/") ? "ds" : iri.startsWith("https://dt.canonical.com/") ? "dt" : iri.startsWith("https://anatomy.canonical.com/") ? "anatomy" : iri.startsWith("http://pragma.canonical.com/") ? "cs" : "schema";
const local = (iri) => iri.replace(/^https?:\/\/[^/]+\//, "").replace("w3c-tokens/", "w3c:");
// nodes: 0 = IRI, 1 = blank, 2 = literal (one per occurrence)
const nodes = []; const idx = new Map();
const nid = (term) => { const k = term.termType + "|" + term.value; let i = idx.get(k); if (i == null) { i = nodes.length; idx.set(k, i); nodes.push({ i, kind: term.termType === "NamedNode" ? 0 : 1, ns: term.termType === "NamedNode" ? nsOf(term.value) : null, label: term.termType === "NamedNode" ? local(term.value) : "_:" + term.value.slice(0, 6), deg: 0, cls: "" }); } return i; };
const edges = []; const typeOf = new Map();
for (const t of tb) { if (t.p.value === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type") { const s = nid(t.s); if (!typeOf.has(s)) typeOf.set(s, local(t.o.value)); } }
const litParent = [];
for (const t of tb) {
  const s = nid(t.s); const p = local(t.p.value);
  let o;
  if (t.o.termType === "Literal") { o = nodes.length; nodes.push({ i: o, kind: 2, ns: null, label: t.o.value.length > 40 ? t.o.value.slice(0, 39) + "…" : t.o.value, deg: 1, cls: "literal", parent: s, pred: p, full: t.o.value.length > 40 ? t.o.value : null }); litParent.push(o); }
  else o = nid(t.o);
  edges.push([s, o, p]); nodes[s].deg++; if (t.o.termType !== "Literal") nodes[o].deg++;
}
for (const [i, c] of typeOf) nodes[i].cls = c;
// blank nodes inherit the namespace of their class or of their nearest IRI subject
for (const n of nodes) if (n.kind === 1) { n.ns = n.cls ? nsOf(n.cls.startsWith("w3c:") ? "https://dt.canonical.com/" : (n.cls.includes("#") ? "http://www.w3.org/" : ({ ds: 1 })[0] ? "" : "")) : null; }
// better: class IRIs for blank nodes — recompute from the typeOf full IRIs
const typeIri = new Map(); for (const t of tb) if (t.p.value.endsWith("#type") && t.s.termType === "BlankNode") { const s = idx.get("BlankNode|" + t.s.value); if (!typeIri.has(s)) typeIri.set(s, t.o.value); }
for (const n of nodes) if (n.kind === 1) n.ns = typeIri.has(n.i) ? nsOf(typeIri.get(n.i)) : "list";
// list cells (rdf:first/rest blank nodes) belong to whoever points at them: propagate ns from parent via edges
const parentNs = new Map(); for (const [s, o] of edges) if (nodes[o].kind === 1 && nodes[o].ns === "list" && nodes[s].ns && nodes[s].ns !== "list") parentNs.set(o, nodes[s].ns);
for (let pass = 0; pass < 6; pass++) for (const [s, o] of edges) if (nodes[o].kind === 1 && nodes[o].ns === "list" && (nodes[s].ns && nodes[s].ns !== "list")) nodes[o].ns = nodes[s].ns;
for (const n of nodes) if (n.ns === "list") n.ns = "dt";
const skel = nodes.filter(n => n.kind !== 2); const skelEdges = edges.filter(([s, o]) => nodes[o].kind !== 2);
console.log("nodes", nodes.length, "iri", nodes.filter(n => n.kind === 0).length, "blank", nodes.filter(n => n.kind === 1).length, "literal", litParent.length, "edges", edges.length, "skeleton edges", skelEdges.length);
// ---- 2D skeleton layout
const anchor = (n) => { if (n.ns === "ds") return [-900, 0]; if (n.ns === "cs") return [0, 900]; if (n.ns === "anatomy") return [-500, 650]; if (n.ns === "dt") return /Variable|Declaration|cond|Condition/.test(n.cls + n.label) ? [700, 450] : [650, -150]; return [0, -900]; };
const S2 = skel.map(n => { const [ax, ay] = anchor(n); return { id: n.i, x: ax + (Math.random() - .5) * 500, y: ay + (Math.random() - .5) * 500, n }; });
const sidx = new Map(S2.map((s, k) => [s.id, k]));
const L2 = skelEdges.map(([s, o]) => ({ source: sidx.get(s), target: sidx.get(o) }));
const sim = forceSimulation(S2).force("link", forceLink(L2).distance(10).strength(0.2)).force("charge", forceManyBody().strength(-5).theta(0.95).distanceMax(400)).force("x", forceX(d => anchor(d.n)[0]).strength(0.06)).force("y", forceY(d => anchor(d.n)[1]).strength(0.06)).force("collide", forceCollide(1.8).iterations(1)).stop();
for (let i = 0; i < 260; i++) { sim.tick(); if (i % 40 === 0) console.log("2d tick", i, Date.now() - t0, "ms"); }
// ---- 3D skeleton layout (seeded from 2D)
const S3 = S2.map(s => ({ id: s.id, x: s.x, y: s.y, z: (Math.random() - .5) * 300, n: s.n }));
const L3 = skelEdges.map(([s, o]) => ({ source: sidx.get(s), target: sidx.get(o) }));
const sim3 = F3.forceSimulation(S3, 3).force("link", F3.forceLink(L3).distance(10).strength(0.2)).force("charge", F3.forceManyBody().strength(-5).theta(0.95).distanceMax(400)).force("x", F3.forceX(d => anchor(d.n)[0]).strength(0.05)).force("y", F3.forceY(d => anchor(d.n)[1]).strength(0.05)).force("z", F3.forceZ(0).strength(0.02)).stop();
for (let i = 0; i < 160; i++) { sim3.tick(); if (i % 40 === 0) console.log("3d tick", i, Date.now() - t0, "ms"); }
// ---- place literal leaves around their subject (ring, radius by count)
const litBy = new Map(); for (const o of litParent) { const p = nodes[o].parent; if (!litBy.has(p)) litBy.set(p, []); litBy.get(p).push(o); }
const pos2 = new Map(S2.map(s => [s.id, [s.x, s.y]])), pos3 = new Map(S3.map(s => [s.id, [s.x, s.y, s.z]]));
for (const [p, list] of litBy) { const [px, py] = pos2.get(p), [qx, qy, qz] = pos3.get(p); const R = 3 + Math.sqrt(list.length) * 1.6; list.forEach((o, k) => { const a = (k / list.length) * Math.PI * 2 + (p % 7) * .3; const rr = R * (0.7 + 0.3 * ((k * 7919) % 13) / 13); pos2.set(o, [px + Math.cos(a) * rr, py + Math.sin(a) * rr]); const th = Math.acos(1 - 2 * ((k + .5) / list.length)), ph = k * 2.399963; pos3.set(o, [qx + rr * Math.sin(th) * Math.cos(ph), qy + rr * Math.sin(th) * Math.sin(ph), qz + rr * Math.cos(th)]); }); }
// normalise
const norm = (get, dims) => { const mins = Array(dims).fill(Infinity), maxs = Array(dims).fill(-Infinity); for (const n of nodes) { const p = get(n.i); for (let d = 0; d < dims; d++) { mins[d] = Math.min(mins[d], p[d]); maxs[d] = Math.max(maxs[d], p[d]); } } const span = Math.max(...maxs.map((m, d) => m - mins[d])); return (i) => get(i).map((v, d) => +(((v - (mins[d] + maxs[d]) / 2) / span) * 2000).toFixed(1)); };
const n2 = norm(i => pos2.get(i), 2), n3 = norm(i => pos3.get(i), 3);
const KIND = ["iri", "blank", "literal"];
const lit = {}; for (const o of litParent) { const full = tb.find(() => false); } 
const out2 = { nodes: nodes.map(n => [...n2(n.i), n.kind, n.ns || "", n.cls, n.deg, n.label]), links: edges.map(e => [e[0], e[1], e[2]]) };
const out3 = { nodes: nodes.map(n => [...n3(n.i), n.kind, n.ns || ""]), links: edges.map(e => [e[0], e[1]]) };
writeFileSync(`${D}/full2d.json`, JSON.stringify(out2));
const literals = {}; for (const o of litParent) if (nodes[o].full) literals[o] = nodes[o].full; writeFileSync(`${D}/literals.json`, JSON.stringify(literals)); console.log("literals.json", Object.keys(literals).length, JSON.stringify(literals).length); writeFileSync(`${D}/full3d.json`, JSON.stringify(out3));
console.log("bytes 2d", JSON.stringify(out2).length, "3d", JSON.stringify(out3).length, Date.now() - t0, "ms");
const byNs = {}; for (const n of nodes) byNs[n.ns + "/" + KIND[n.kind]] = (byNs[n.ns + "/" + KIND[n.kind]] || 0) + 1; console.log(byNs);
