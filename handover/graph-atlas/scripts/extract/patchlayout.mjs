import { readFileSync, writeFileSync } from "node:fs";
const D = "/home/user/graph-atlas/data";
const { nodes, edges } = JSON.parse(readFileSync(`${D}/entities.json`, "utf-8"));
const idx = new Map(nodes.map((n, i) => [n.s, i])); const all = nodes.map(n => n.s);
for (const e of edges) if (!idx.has(e.o)) { idx.set(e.o, all.length); all.push(e.o); }
const L = JSON.parse(readFileSync(`${D}/layout.json`, "utf-8"));
if (L.nodes.length !== all.length) throw new Error("order mismatch " + L.nodes.length + " vs " + all.length);
const local = (iri) => iri.replace(/^https?:\/\/[^/]+\//, "").replace("w3c-tokens/", "w3c:");
L.nodes.forEach((n, i) => { if (n.length === 6) n.push(local(all[i])); else n[6] = local(all[i]); });
writeFileSync(`${D}/layout.json`, JSON.stringify(L)); console.log("patched", L.nodes.length, L.nodes[0]);
