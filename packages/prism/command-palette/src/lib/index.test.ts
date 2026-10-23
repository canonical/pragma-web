import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import * as publicApi from "./index.js";

/**
 * Read a file that sits next to this test, located from vitest's `testPath`,
 * since `import.meta.url` is not a file URL under jsdom.
 */
function readBesideTest(relativePath: string): string {
  const testPath = expect.getState().testPath;
  if (typeof testPath !== "string") {
    throw new Error("vitest did not expose the current test path");
  }
  return readFileSync(join(dirname(testPath), relativePath), "utf8");
}

/** Collect the backticked names in a piece of Markdown, sorted. */
function collectBacktickedNames(markdown: string): string[] {
  return [...markdown.matchAll(/`([^`]+)`/g)]
    .map((match) => match.at(1))
    .filter((name): name is string => name !== undefined)
    .sort();
}

/**
 * Split the README's "Public API" section into its bullets, each cut at
 * `; types` into the runtime names before it and the type names after it.
 */
function splitDocumentedBullets(): { values: string; types: string }[] {
  const section = readBesideTest(join("..", "..", "README.md"))
    .split("\n## Public API\n")
    .at(1);
  if (section === undefined) {
    throw new Error("README.md has no '## Public API' section");
  }
  return section
    .split(/^- /m)
    .slice(1)
    .map((bullet) => {
      const [values = "", types = ""] = bullet.split("; types");
      return { values, types };
    });
}

/**
 * Collect the type names the barrel re-exports, from its `export type { … }`
 * statements: types leave no runtime trace, so the source is the only record.
 */
function collectBarrelTypeNames(): string[] {
  return [...readBesideTest("index.ts").matchAll(/export type \{([^}]+)\}/g)]
    .flatMap((match) => (match.at(1) ?? "").split(","))
    .map((name) => name.trim())
    .filter((name) => name !== "")
    .sort();
}

describe("the package barrel", () => {
  it("exports the palette alone", () => {
    expect(Object.keys(publicApi)).toEqual(["CommandPalette"]);
  });

  it("exports exactly the runtime names the README documents", () => {
    const documented = collectBacktickedNames(
      splitDocumentedBullets()
        .map(({ values }) => values)
        .join("\n"),
    );
    expect(Object.keys(publicApi).sort()).toEqual(documented);
  });

  it("exports exactly the type names the README documents", () => {
    const documented = collectBacktickedNames(
      splitDocumentedBullets()
        .map(({ types }) => types)
        .join("\n"),
    );
    expect(collectBarrelTypeNames()).toEqual(documented);
  });
});
