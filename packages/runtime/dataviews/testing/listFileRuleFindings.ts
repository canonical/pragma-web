import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import judgeExports from "./judgeExports.js";
import listExports from "./listExports.js";
import readFileRole from "./readFileRole.js";

/** A type test, which the rules forbid. */
const TYPES_TEST = /\.types\.test\.tsx?$/;

/**
 * Whether a folder holds `stem.test.ts(x)` or `stem.<facet>.test.ts(x)`, a
 * type test aside.
 */
function hasColocatedTest(stem: string, siblings: readonly string[]): boolean {
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const test = new RegExp(`^${escaped}(?:\\.[\\w-]+)*\\.test\\.tsx?$`);
  return siblings.some((name) => test.test(name) && !TYPES_TEST.test(name));
}

/** Judge every source file under one folder, depth first, into `findings`. */
function judgeFolder(root: string, folder: string, findings: string[]): void {
  const entries = readdirSync(folder, { withFileTypes: true });
  const siblings = entries.map((entry) => entry.name);
  for (const entry of entries) {
    const path = join(folder, entry.name);
    const file = relative(root, path).split(sep).join("/");
    if (entry.isDirectory()) {
      judgeFolder(root, path, findings);
    } else if (TYPES_TEST.test(entry.name)) {
      findings.push(`${file} types-test`);
    } else if (readFileRole(entry.name) === "source") {
      const stem = entry.name.replace(/\.tsx?$/, "");
      const exports = listExports(readFileSync(path, "utf8"));
      for (const finding of judgeExports(stem, exports)) {
        findings.push(`${file} export:${finding}`);
      }
      const isPureType =
        exports.length > 0 && exports.every((record) => record.kind === "type");
      if (!isPureType && !hasColocatedTest(stem, siblings)) {
        findings.push(`${file} test`);
      }
    }
  }
}

/**
 * List every finding of the two file rules under a package's `src/` and
 * `testing/` folders, as `"<path> <rule>"` lines sorted: the export rule as
 * `export:<finding>`, a missing colocated test as `test`, and a type test
 * as `types-test`.
 *
 * @note Impure by design: it reads the file system under `packageRoot`.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function listFileRuleFindings(
  packageRoot: string,
): readonly string[] {
  const findings: string[] = [];
  for (const top of ["src", "testing"]) {
    const folder = join(packageRoot, top);
    if (existsSync(folder)) {
      judgeFolder(packageRoot, folder, findings);
    }
  }
  return findings.sort();
}
