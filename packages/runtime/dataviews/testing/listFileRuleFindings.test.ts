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

  it("skips a missing folder", () => {
    writeFile("testing/d.ts", "export default 1;");
    expect(listFileRuleFindings(join(root, "testing"))).toEqual([]);
  });
});
