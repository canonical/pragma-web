import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import listUnmarkedNames from "./listUnmarkedNames.js";

const root = mkdtempSync(join(tmpdir(), "unmarked-"));

/** Write one file under the temporary folder, making its folders. */
function writeFile(path: string, text: string): void {
  const full = join(root, path);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, text);
}

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("listUnmarkedNames", () => {
  it("lists the exported names without the tag, or without a declaration", () => {
    writeFile(
      "lib/a/readA.ts",
      "/** Reads.\n * @experimental Soon. */\nexport default function readA() {}",
    );
    writeFile("lib/a/types.ts", "/** A shape. */\nexport type Shape = 1;");
    writeFile("lib/a/styles.css", "");
    writeFile(
      "lib/index.ts",
      [
        'export { default as readA } from "./a/readA.js";',
        'export type { Shape } from "./a/types.js";',
        'export type { Missing } from "./a/types.js";',
        'export * from "./a/types.js";',
      ].join("\n"),
    );
    expect(listUnmarkedNames(join(root, "lib/index.ts"), root)).toEqual([
      "Missing",
      "Shape",
    ]);
  });
});
