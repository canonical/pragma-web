import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
// Inline @import chains without touching anything inside comments.
const seen = new Set<string>();
const resolveSpec = (spec: string, from: string) => spec.startsWith(".") || spec.startsWith("/") ? resolve(dirname(from), spec) : (() => { try { return Bun.resolveSync(spec, dirname(from)); } catch { return resolve(process.cwd(), "node_modules", spec); } })();
const unresolved: string[] = [];
function flatten(file: string): string {
  const real = resolve(file); if (seen.has(real)) return ""; seen.add(real);
  const src = readFileSync(real, "utf-8");
  // split into comment and code segments; only code segments are rewritten
  return src.split(/(\/\*[\s\S]*?\*\/)/g).map((seg, i) => i % 2 ? seg : seg.replace(/@import\s+(?:url\(\s*(["']?)([^"')]+)\1\s*\)|(["'])([^"']+)\3)\s*([^;]*);/g, (m, q1, s1, q2, s2, extra) => {
    const spec = s1 || s2; let target: string; try { target = resolveSpec(spec, real); readFileSync(target); } catch { unresolved.push(spec + " from " + real.split("node_modules/")[1]); return `/* unresolved ${spec} */`; }
    const inner = flatten(target); const layer = (extra || "").trim().match(/^layer\(([^)]+)\)$/);
    return layer ? `@layer ${layer[1]} {\n${inner}\n}` : inner;
  })).join("");
}
let out = flatten(resolve("entry.css"));
out = out.replace(/url\(\s*(["']?)\/icons\//g, "url($1icons/");
// @layer statements and @import must precede other rules; hoist the layer-order statement to the very top
const order = out.match(/@layer\s+normalize,[\s\S]*?;/);
if (order) out = order[0] + "\n" + out.replace(order[0], "");
writeFileSync("bundle.css", out);
console.log("bytes", out.length, "unresolved", unresolved, "icons", [...new Set([...out.matchAll(/icons\/([a-z0-9-]+)\.svg/g)].map(m => m[1]))].join(","));
