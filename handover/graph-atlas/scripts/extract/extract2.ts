import { spawnSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
const OUT = "/home/user/graph-atlas/data";
function q(sparql: string): Record<string, string>[] {
  const r = spawnSync("/root/.local/bin/pragma", ["graph", "query", sparql, "--format", "json"], { encoding: "utf-8", maxBuffer: 1 << 28, cwd: "/home/user" });
  if (r.status !== 0) { console.error("QUERY FAILED", sparql, r.stderr); return []; }
  return JSON.parse(r.stdout).data?.bindings ?? [];
}
// all resolved values
const values = q("SELECT ?name ?type ?coord ?value (COUNT(?cell) AS ?chain) WHERE { ?rv a dt:ResolvedValue ; dt:forSymbol ?s ; dt:resolvesTo ?value . ?s rdfs:label ?name . OPTIONAL { ?t dt:symbol ?s ; dt:tokenType ?type } OPTIONAL { ?rv dt:coordinate ?coord } OPTIONAL { ?rv dt:resolutionChain ?l . ?l rdf:rest* ?cell } } GROUP BY ?name ?type ?coord ?value");
const seen = new Set<string>(); const dedup = values.filter(v => { const k = v.name + "|" + (v.coord || "") ; if (seen.has(k)) return false; seen.add(k); return true; });
writeFileSync(`${OUT}/values.json`, JSON.stringify(dedup)); console.log("values", values.length, dedup.length);
// variables fixed
const variables = q("SELECT ?v ?name ?tier ?vis ?sym (COUNT(DISTINCT ?d) AS ?decls) (COUNT(DISTINCT ?ref) AS ?refs) (COUNT(DISTINCT ?al) AS ?aliases) WHERE { ?v a dt:Variable . OPTIONAL { ?v rdfs:label ?name } OPTIONAL { ?v dt:tier ?tier } OPTIONAL { ?v dt:visibility ?vis } OPTIONAL { ?v dt:ofSymbol ?sym } OPTIONAL { ?v dt:declaredAt ?d } OPTIONAL { ?v dt:refersTo ?ref } OPTIONAL { ?v dt:aliasOf ?al } } GROUP BY ?v ?name ?tier ?vis ?sym");
const declConds = q("SELECT ?cond ?selector ?atRule ?layer (COUNT(?d) AS ?n) WHERE { ?d a dt:Declaration ; dt:under ?cond . OPTIONAL { ?cond dt-web:selector ?selector } OPTIONAL { ?cond dt-web:inAtRule ?atRule } } GROUP BY ?cond ?selector ?atRule ?layer ORDER BY DESC(?n)");
const condProps = q("SELECT ?p ?o WHERE { dt:s4/web/cond/layer-ds-modifiers/root ?p ?o }");
const declFiles = q("SELECT ?file (COUNT(?d) AS ?n) WHERE { ?d a dt:Declaration ; dt:at ?at . BIND(REPLACE(STR(?at), ':.*$', '') AS ?file) } GROUP BY ?file ORDER BY DESC(?n)");
const derivations = q("SELECT ?der ?label (COUNT(?d) AS ?n) WHERE { ?d dt:derives ?der . OPTIONAL { ?der rdfs:label ?label } } GROUP BY ?der ?label");
const varTierVis = q("SELECT ?tier ?vis ?type (COUNT(?v) AS ?n) WHERE { ?v a dt:Variable ; dt:tier ?tier ; dt:visibility ?vis . OPTIONAL { ?v dt:ofSymbol ?s . ?t dt:symbol ?s ; dt:tokenType ?type } } GROUP BY ?tier ?vis ?type");
const refersTo = q("SELECT ?fromTier ?toTier (COUNT(*) AS ?n) WHERE { ?a dt:refersTo ?b . OPTIONAL { ?a dt:tier ?fromTier } OPTIONAL { ?b dt:tier ?toTier } } GROUP BY ?fromTier ?toTier");
const refEdges = q("SELECT ?a ?b WHERE { ?a a dt:Variable ; dt:refersTo ?b . ?b a dt:Variable }");
const aliasEdges = q("SELECT ?a ?b WHERE { ?a a dt:Variable ; dt:aliasOf ?b . ?b a dt:Variable }");
const tokenGroups = q("SELECT ?g ?name (COUNT(?t) AS ?n) WHERE { ?g a w3c-tokens:Group . OPTIONAL { ?g w3c-tokens:name ?name } OPTIONAL { ?t w3c-tokens:inGroup|w3c-tokens:group|w3c-tokens:parent ?g } } GROUP BY ?g ?name");
const tok = JSON.parse(readFileSync(`${OUT}/tokens.json`, "utf-8"));
Object.assign(tok, { variables, declConds, condProps, declFiles, derivations, varTierVis, refersTo, refEdges, aliasEdges, tokenGroups });
writeFileSync(`${OUT}/tokens.json`, JSON.stringify(tok)); console.log("tokens updated", variables.length, declConds.length, refEdges.length, aliasEdges.length);
// libraries fixed
const libs = q("SELECT ?l ?p ?o WHERE { ?l a ds:ImplementationLibrary ; ?p ?o FILTER(?p != ds:hasImplementation) }");
const imp = JSON.parse(readFileSync(`${OUT}/implementations.json`, "utf-8"));
imp.libProps = libs; writeFileSync(`${OUT}/implementations.json`, JSON.stringify(imp)); console.log("libs", libs.length);
// standards dedupe
const st = JSON.parse(readFileSync(`${OUT}/standards.json`, "utf-8"));
const byS = new Map<string, any>();
for (const r of st.standards) { const cur = byS.get(r.s); if (!cur) byS.set(r.s, { ...r, ext: r.ext ? [r.ext] : [] }); else { if (r.ext && !cur.ext.includes(r.ext)) cur.ext.push(r.ext); } }
st.standards = [...byS.values()]; 
const cats = new Map<string, any>(); for (const c of st.categories) { const cur = cats.get(c.c); if (!cur) cats.set(c.c, c); else if (c.label && c.label !== c.label.toLowerCase()) cats.set(c.c, { ...cur, label: c.label }); }
st.categories = [...cats.values()];
writeFileSync(`${OUT}/standards.json`, JSON.stringify(st)); console.log("standards", st.standards.length, st.categories.length);
// button anatomy + sample inspect
const btn = q("SELECT ?dsl ?classic WHERE { ds:global.component.button ds:anatomyDsl ?dsl . OPTIONAL { ds:global.component.button ds:anatomyClassic ?classic } }");
writeFileSync(`${OUT}/button.json`, JSON.stringify(btn[0] ?? {})); console.log("button", (btn[0]?.dsl || "").length);
