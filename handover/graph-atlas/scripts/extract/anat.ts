import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const OUT = "/home/user/graph-atlas/data";
const r = spawnSync("/root/.local/bin/pragma", ["graph", "query", "SELECT ?b ?name ?class ?tier ?dsl WHERE { ?b ds:anatomyDsl ?dsl ; ds:name ?name ; ds:tier ?tier ; a ?class . VALUES ?class { ds:Component ds:Subcomponent ds:Pattern ds:Layout ds:View ds:Group ds:Variant } }", "--format", "json"], { encoding: "utf-8", maxBuffer: 1 << 28, cwd: "/home/user" });
const rows = JSON.parse(r.stdout).data.bindings;
const local = (iri: string) => iri.replace(/^https?:\/\/[^/]+\//, "");
const out: any[] = []; let failed = 0;
const stylesOf = (styles: any) => Object.entries(styles || {}).map(([k, v]) => { const [key, state] = k.split("@"); return { key, state: state || "default", value: Array.isArray(v) ? v : [v] }; });
function walk(n: any, rel: any, depth: number, acc: any): any {
  const node = n.node || n; const uri = node.uri || n.uri; const role = node.role;
  const styles = stylesOf(node.styles);
  const o: any = { u: uri || null, r: role || null, d: depth, s: styles.length, k: Object.keys(node.styles || {}).length, c: [] as any[], rel: rel ? { slot: rel.slotName || null, card: rel.cardinality != null ? String(rel.cardinality) : null } : null };
  acc.nodes++; acc.maxDepth = Math.max(acc.maxDepth, depth); if (uri) acc.named++; else acc.anon++;
  if (rel?.slotName) acc.slots.push(String(rel.slotName)); if (rel?.cardinality != null) acc.cards.push(String(rel.cardinality));
  for (const st of styles) { acc.keys.add(st.key); acc.states[st.state] = (acc.states[st.state] || 0) + 1; acc.styleCount++; for (const v of st.value) if (typeof v === "string" && /^[a-z]+\.[a-z0-9.]+/i.test(v) && !/^(layout|appearance)/.test(v)) acc.tokens.add(v); }
  if (uri) acc.refs.add(uri);
  if (node.switch) acc.switches++;
  for (const e of node.edges || []) o.c.push(walk(e.node ? e : { node: { uri: e.uri }, relation: e.relation }, e.relation, depth + 1, acc));
  return o;
}
for (const row of rows) {
  let tree: any; try { tree = Bun.YAML.parse(row.dsl); } catch (e) { failed++; out.push({ b: row.b, name: row.name, grain: local(row.class).toLowerCase(), tier: local(row.tier), error: String(e).slice(0, 80), chars: row.dsl.length }); continue; }
  if (!tree || !tree.node) { out.push({ b: row.b, name: row.name, grain: local(row.class).toLowerCase(), tier: local(row.tier), empty: true, chars: row.dsl.length, raw: row.dsl.slice(0, 120) }); continue; }
  const acc = { nodes: 0, named: 0, anon: 0, maxDepth: 0, slots: [] as string[], cards: [] as string[], keys: new Set<string>(), states: {} as any, styleCount: 0, tokens: new Set<string>(), refs: new Set<string>(), switches: 0 };
  const t = walk(tree, null, 0, acc);
  const selfUri = tree.node.uri;
  out.push({ b: row.b, name: row.name, grain: local(row.class).toLowerCase(), tier: local(row.tier), chars: row.dsl.length, lines: row.dsl.split("\n").length, nodes: acc.nodes, named: acc.named, anon: acc.anon, depth: acc.maxDepth, slots: acc.slots, cards: acc.cards, keys: [...acc.keys], states: acc.states, styleCount: acc.styleCount, tokens: acc.tokens.size, refs: [...acc.refs].filter(u => u !== selfUri), self: selfUri || null, switches: acc.switches, tree: t });
}
writeFileSync(`${OUT}/anatomies.json`, JSON.stringify(out));
const ok = out.filter(o => o.nodes);
console.log("blocks", rows.length, "parsed", ok.length, "failed", failed, "empty", out.filter(o => o.empty).length, "bytes", JSON.stringify(out).length);
console.log("nodes: total", ok.reduce((a, o) => a + o.nodes, 0), "max", Math.max(...ok.map(o => o.nodes)), "depth max", Math.max(...ok.map(o => o.depth)), "refs total", ok.reduce((a, o) => a + o.refs.length, 0));
console.log("empties sample", out.filter(o => o.empty).slice(0, 3).map(o => [o.name, o.raw]));
console.log("top", ok.sort((a, b) => b.nodes - a.nodes).slice(0, 8).map(o => `${o.name}:${o.nodes}n/${o.depth}d/${o.styleCount}s`));
console.log("slots", Object.entries(ok.flatMap(o => o.slots).reduce((m: any, s) => (m[s] = (m[s] || 0) + 1, m), {})).sort((a: any, b: any) => b[1] - a[1]).slice(0, 12));
console.log("cards", Object.entries(ok.flatMap(o => o.cards).reduce((m: any, s) => (m[s] = (m[s] || 0) + 1, m), {})).sort((a: any, b: any) => b[1] - a[1]));
