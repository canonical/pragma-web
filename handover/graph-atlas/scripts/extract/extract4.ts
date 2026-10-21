import { spawnSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
const OUT = "/home/user/graph-atlas/data";
function q(sparql: string): Record<string, string>[] {
  const r = spawnSync("/root/.local/bin/pragma", ["graph", "query", sparql, "--format", "json"], { encoding: "utf-8", maxBuffer: 1 << 28, cwd: "/home/user" });
  if (r.status !== 0) { console.error("QUERY FAILED", sparql, r.stderr); return []; }
  return JSON.parse(r.stdout).data?.bindings ?? [];
}
const declByTierCond = q("SELECT ?tier ?cond (COUNT(?d) AS ?n) WHERE { ?v a dt:Variable ; dt:tier ?tier ; dt:declaredAt ?d . ?d dt:under ?cond } GROUP BY ?tier ?cond ORDER BY DESC(?n)");
const fileTypeSym = q("SELECT ?file ?type (COUNT(DISTINCT ?t) AS ?tokens) (COUNT(DISTINCT ?s) AS ?symbols) WHERE { ?t a w3c-tokens:Token ; w3c-tokens:inFile ?f ; dt:tokenType ?type ; dt:symbol ?s . BIND(REPLACE(STR(?f), '^.*/file/', '') AS ?file) } GROUP BY ?file ?type");
const typeTier = q("SELECT ?type ?tier (COUNT(DISTINCT ?v) AS ?n) WHERE { ?v a dt:Variable ; dt:tier ?tier ; dt:ofSymbol ?s . ?t dt:symbol ?s ; dt:tokenType ?type } GROUP BY ?type ?tier");
const varNoSymbol = q("SELECT ?tier (COUNT(?v) AS ?n) WHERE { ?v a dt:Variable ; dt:tier ?tier FILTER NOT EXISTS { ?v dt:ofSymbol ?s } } GROUP BY ?tier");
const symNoVar = q("SELECT ?type (COUNT(?s) AS ?n) WHERE { ?s a dt:TokenSymbol . ?t dt:symbol ?s ; dt:tokenType ?type FILTER NOT EXISTS { ?v dt:ofSymbol ?s } } GROUP BY ?type");
const condDetail = q("SELECT ?cond ?p ?o WHERE { ?cond a dt:Condition ; ?p ?o }");
const tok = JSON.parse(readFileSync(`${OUT}/tokens.json`, "utf-8"));
Object.assign(tok, { declByTierCond, fileTypeSym, typeTier, varNoSymbol, symNoVar, condDetail });
writeFileSync(`${OUT}/tokens.json`, JSON.stringify(tok));
console.log("declByTierCond", declByTierCond.length, "fileTypeSym", fileTypeSym.length, "typeTier", typeTier, "varNoSymbol", varNoSymbol, "symNoVar", symNoVar);
console.log(condDetail.slice(0, 12));
// button anatomy tree
const btn = JSON.parse(readFileSync(`${OUT}/button.json`, "utf-8"));
const tree = Bun.YAML.parse(btn.dsl);
writeFileSync(`${OUT}/button-tree.json`, JSON.stringify(tree));
console.log(JSON.stringify(tree).slice(0, 800));
