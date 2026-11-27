import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * `index.css` is the one file a consumer links to get every component's CSS.
 * It is a hand-written list, on purpose — the constitution prefers an explicit
 * import over a build step that discovers stylesheets by naming convention —
 * and a hand-written list is exactly the kind of thing that goes stale the
 * first time somebody adds a component and forgets the line.
 *
 * So this is the drift check, and it is the whole reason the list is allowed
 * to be hand-written: the set of paths the file imports must equal the set of
 * stylesheets under `src/lib`, and the lines must be in the order a reader
 * would put them in. Nothing here generates anything; it only refuses to let
 * the two disagree.
 *
 * `index.css` also imports `density.css`, which is not a component sheet. The
 * comparison below filters to the `lib/` imports so the density import does
 * not make the two sides disagree.
 */

// `path.dirname(fileURLToPath(import.meta.url))` and not `new URL(".", …)`:
// the tests run in jsdom, whose global `URL` is not Node's, and resolving a
// relative reference through it loses the `file:` scheme.
const srcDir = path.dirname(fileURLToPath(import.meta.url));
const libDir = path.join(srcDir, "lib");

/**
 * The density testbed's sheets style its proof page with unprefixed classes
 * (`.baseline`, `.density-dense`), so they stay out of the published entry.
 */
const excluded = ["_work_in_progress/DensityTestbed/"];

/** Every component stylesheet under `src/lib`, as a path relative to `src`. */
const stylesheetsOnDisk = readdirSync(libDir, { recursive: true })
  .map((entry) => String(entry).split(path.sep).join("/"))
  .filter((rel) => rel.endsWith(".css"))
  .filter((rel) => !excluded.some((prefix) => rel.startsWith(prefix)))
  .map((rel) => `lib/${rel}`);

/** The component stylesheets `index.css` imports, in the order it imports them. */
const imported = [
  ...readFileSync(path.join(srcDir, "index.css"), "utf8").matchAll(
    /^@import url\("\.\/(.+?)"\);$/gm,
  ),
]
  .map(([, importPath]) => importPath)
  .filter((importPath) => importPath.startsWith("lib/"));

describe("index.css lists every component stylesheet", () => {
  it("finds the stylesheets it is meant to compare against", () => {
    // A guard on the guard: a rename that empties either side would otherwise
    // make the two comparisons below pass by matching nothing.
    expect(stylesheetsOnDisk.length).toBeGreaterThan(0);
    expect(imported.length).toBe(stylesheetsOnDisk.length);
  });

  it("imports exactly the stylesheets on disk", () => {
    expect([...imported].sort()).toEqual([...stylesheetsOnDisk].sort());
  });

  it("lists them alphabetically", () => {
    expect(imported).toEqual([...imported].sort());
  });
});
