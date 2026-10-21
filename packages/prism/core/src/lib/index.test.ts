import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import * as publicApi from "./index.js";

/**
 * Read the runtime names the README's "Public API" section documents: in each
 * bullet, the backticked names before `; types` (the type names after it
 * leave no runtime trace to compare). The README is located from vitest's
 * `testPath`, since `import.meta.url` is not a file URL under jsdom.
 */
function readDocumentedValueNames(): string[] {
  const testPath = expect.getState().testPath;
  if (typeof testPath !== "string") {
    throw new Error("vitest did not expose the current test path");
  }
  const readme = readFileSync(
    join(dirname(testPath), "..", "..", "README.md"),
    "utf8",
  );
  const section = readme.split("\n## Public API\n").at(1);
  if (section === undefined) {
    throw new Error("README.md has no '## Public API' section");
  }
  return section
    .split(/^- /m)
    .slice(1)
    .flatMap((bullet) => {
      const values = bullet.split("; types").at(0) ?? "";
      return [...values.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    })
    .filter((name): name is string => name !== undefined)
    .sort();
}

describe("the package barrel", () => {
  it("exports exactly the runtime names the README documents", () => {
    expect(Object.keys(publicApi).sort()).toEqual(readDocumentedValueNames());
  });
});
