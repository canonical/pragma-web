import { describe, expect, it } from "vitest";
import indexCss from "./index.css?raw";

/**
 * `index.css` is the one file a consumer links to get every component's CSS.
 * It is a hand-written list, on purpose — the constitution prefers an explicit
 * import over a build step that discovers stylesheets by naming convention —
 * and a hand-written list is exactly the kind of thing that goes stale the
 * first time somebody adds a component and forgets the line.
 *
 * So this is the drift check, and it is the whole reason the list is allowed
 * to be hand-written: the set of paths the file imports must equal the set of
 * `styles.css` files under `src/lib`, and the lines must be in the order a
 * reader would put them in. Nothing here generates anything; it only refuses
 * to let the two disagree.
 */

/**
 * Every `styles.css` under `src/lib`, as a path relative to `src/lib`. The
 * tests run in a browser, so the file system is read through Vite's glob
 * import, which lists the matching files when the test is transformed.
 */
const stylesheetsOnDisk = Object.keys(
  import.meta.glob("./**/styles.css", { query: "?raw" }),
).map((key) => key.replace(/^\.\//, ""));

/** The paths `index.css` imports, in the order it imports them. */
const imported = [...indexCss.matchAll(/^@import url\("\.\/(.+?)"\);$/gm)].map(
  ([, importPath]) => importPath,
);

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
