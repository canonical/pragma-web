import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import listFileRuleFindings from "./listFileRuleFindings.js";

const root = mkdtempSync(join(tmpdir(), "file-rules-"));

/** Write one file under the temporary package, making its folders. */
function writeFile(path: string, text: string): void {
  const full = join(root, path);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, text);
}

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("listFileRuleFindings", () => {
  it("lists every finding under src and testing, sorted", () => {
    writeFile("src/lib/a.ts", "export default function a() {}");
    writeFile("src/lib/a.facet.test.ts", "");
    writeFile("src/lib/b.ts", "const b = 1;\nexport { b };");
    writeFile("src/lib/types.ts", "export type T = 1;");
    writeFile("src/lib/index.ts", "export * from './a.js';");
    writeFile("src/lib/styles.css", "");
    writeFile("src/lib/c+.ts", "");
    writeFile("src/lib/c+.test.ts", "");
    writeFile("README.md", "");
    expect(listFileRuleFindings(root)).toEqual([
      "src/lib/b.ts export:exported-at-end",
      "src/lib/b.ts export:one-value",
      "src/lib/b.ts test",
      "src/lib/c+.ts export:none",
    ]);
  });

  it("finds a type test, which is no colocated test", () => {
    writeFile("types/src/e.ts", "export default function e() {}");
    writeFile("types/src/e.types.test.ts", "");
    expect(listFileRuleFindings(join(root, "types"))).toEqual([
      "src/e.ts test",
      "src/e.types.test.ts types-test",
    ]);
  });

  it("finds a test of a pure type file", () => {
    writeFile("typed/src/types.ts", "export type T = 1;");
    writeFile("typed/src/types.test.ts", "");
    expect(listFileRuleFindings(join(root, "typed"))).toEqual([
      "src/types.test.ts types-test",
    ]);
  });

  it("leaves a facet file's test to that file", () => {
    writeFile("facet/src/a.ts", "export type A = 1;");
    writeFile("facet/src/a.b.ts", "export const B = 1;\nexport const C = 2;");
    writeFile("facet/src/a.b.test.ts", "");
    expect(listFileRuleFindings(join(root, "facet"))).toEqual([]);
  });

  it("owes a value file its own test, not a facet file's", () => {
    writeFile("value/src/a.ts", "export default function a() {}");
    writeFile("value/src/a.b.ts", "export const B = 1;\nexport const C = 2;");
    writeFile("value/src/a.b.test.ts", "");
    expect(listFileRuleFindings(join(root, "value"))).toEqual([
      "src/a.ts test",
    ]);
  });

  it("skips a missing folder", () => {
    writeFile("testing/d.ts", "export default 1;");
    expect(listFileRuleFindings(join(root, "testing"))).toEqual([]);
  });
});
