import { spawnSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
const OUT = "/home/user/graph-atlas/data";
function q(sparql: string): Record<string, string>[] {
  const r = spawnSync("/root/.local/bin/pragma", ["graph", "query", sparql, "--format", "json"], { encoding: "utf-8", maxBuffer: 1 << 28, cwd: "/home/user" });
  if (r.status !== 0) { console.error("QUERY FAILED", sparql, r.stderr); return []; }
  return JSON.parse(r.stdout).data?.bindings ?? [];
}
const symRefs = q("SELECT ?a ?b ?file (COUNT(*) AS ?n) WHERE { ?t dt:symbol ?sa ; dt:refersTo ?sb . ?sa rdfs:label ?a . ?sb rdfs:label ?b . OPTIONAL { ?t w3c-tokens:inFile ?f BIND(REPLACE(STR(?f), '^.*/file/', '') AS ?file) } } GROUP BY ?a ?b ?file");
const symAlias = q("SELECT ?a ?b (COUNT(*) AS ?n) WHERE { ?t dt:symbol ?sa ; dt:aliasOf ?sb . ?sa rdfs:label ?a . ?sb rdfs:label ?b } GROUP BY ?a ?b");
const symSym = q("SELECT ?p ?a ?b WHERE { ?sa a dt:TokenSymbol ; ?p ?sb . ?sb a dt:TokenSymbol . ?sa rdfs:label ?a . ?sb rdfs:label ?b }");
const tok = JSON.parse(readFileSync(`${OUT}/tokens.json`, "utf-8"));
Object.assign(tok, { symRefs, symAlias, symSym });
writeFileSync(`${OUT}/tokens.json`, JSON.stringify(tok)); console.log("symRefs", symRefs.length, "alias", symAlias.length, "symSym", symSym.length, symSym.slice(0,3));
