// @vitest-environment node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/** The repository's root, six folders above this file's folder. */
const ROOT = fileURLToPath(new URL("../../../../../../", import.meta.url));

/** The package's sources. */
const PACKAGE_SOURCES = join(ROOT, "packages/prism/projections/src");

/** The folder that holds the apps, each with its own `src`. */
const APPS = join(ROOT, "apps/react");

/**
 * The names a map-driven dispatch went by: the function that rendered an
 * arm out of a map, the maps' types, and the package's and the sites' maps.
 * Each is joined from its parts, so this file never holds the name it looks
 * for and the check never finds itself.
 */
const DISPATCH_NAMES = new RegExp(
  [
    ["render", "Arm"],
    ["Projection", "Map"],
    ["site", "Projection", "Maps"],
    ["projection", "Maps"],
  ]
    .map((parts) => parts.join(""))
    .join("|"),
);

/** List every TypeScript source under a folder, as the grep's includes do. */
function listSources(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return listSources(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/** Every line of `paths` that names a map-driven dispatch, as `file:line`. */
function listDispatchLines(paths: readonly string[]): string[] {
  return paths.flatMap((path) =>
    readFileSync(path, "utf8")
      .split("\n")
      .flatMap((line, index) =>
        DISPATCH_NAMES.test(line)
          ? [`${relative(ROOT, path)}:${index + 1}: ${line.trim()}`]
          : [],
      ),
  );
}

/** The sources the check reads: the package's and every app's. */
const SOURCES = [
  ...listSources(PACKAGE_SOURCES),
  ...readdirSync(APPS, { withFileTypes: true })
    .map((entry) => join(APPS, entry.name, "src"))
    .filter((sources) => existsSync(sources))
    .flatMap(listSources),
];

describe("the dispatch (Annex A7)", () => {
  it("reads the package's sources and the sites'", () => {
    const read = SOURCES.map((path) => relative(ROOT, path));
    expect(read).toContain(
      "packages/prism/projections/src/testing/integration/dispatch.test.ts",
    );
    expect(
      read.some((path) => path.startsWith("apps/react/prism-metro/src/")),
    ).toBe(true);
    expect(
      read.some((path) => path.startsWith("apps/react/pragma-docs/src/")),
    ).toBe(true);
  });

  it("names no map-driven dispatch in the package or the sites", () => {
    expect(listDispatchLines(SOURCES)).toEqual([]);
  });

  it("finds a line that names one", () => {
    const probe = ["const arm = render", "Arm(maps.chip, node);"].join("");
    expect(DISPATCH_NAMES.test(probe)).toBe(true);
    expect(DISPATCH_NAMES.test("switch (data.__typename) {")).toBe(false);
  });
});
