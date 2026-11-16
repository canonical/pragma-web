import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import judgeExports from "./judgeExports.js";
import listExports from "./listExports.js";
import readFileRole from "./readFileRole.js";

/** A type test, which the rules forbid. */
const TYPES_TEST = /\.types\.test\.tsx?$/;

/**
 * The tests in a folder named `stem.test.ts(x)` or `stem.<facet>.test.ts(x)`,
 * type tests aside.
 */
function listColocatedTests(
  stem: string,
  siblings: readonly string[],
): readonly string[] {
  const escaped = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const test = new RegExp(`^${escaped}(?:\\.[\\w-]+)*\\.test\\.tsx?$`);
  return siblings.filter((name) => test.test(name) && !TYPES_TEST.test(name));
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
      // A longer sibling source, such as `a.b.ts`, claims `a.b.test.ts`.
      const claimed = siblings
        .filter((name) => name !== entry.name && name.startsWith(`${stem}.`))
        .filter((name) => readFileRole(name) === "source")
        .flatMap((name) =>
          listColocatedTests(name.replace(/\.tsx?$/, ""), siblings),
        );
      const tests = listColocatedTests(stem, siblings).filter(
        (test) => !claimed.includes(test),
      );
      if (isPureType) {
        // A pure type file gets no test: one beside it is a type test.
        for (const name of tests) {
          const test = relative(root, join(folder, name)).split(sep).join("/");
          findings.push(`${test} types-test`);
        }
      } else if (tests.length === 0) {
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
