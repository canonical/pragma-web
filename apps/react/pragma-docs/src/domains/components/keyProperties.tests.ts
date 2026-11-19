// @vitest-environment node

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/** The app's source folder. */
const SOURCE_ROOT = fileURLToPath(new URL("../..", import.meta.url));

/** The files that may name the properties a list shows: the provider's site lens, since the site keeps no lens file of its own. */
const LENS_FILES: readonly string[] = [];

/** The index lists, each of which draws its nodes through `NodeList`. */
const INDEX_LISTS: readonly string[] = [
  "domains/components/lib/ComponentsCatalogPage/common/CatalogList/CatalogList.tsx",
];

/**
 * A hand-written key-property list: a literal array of property names
 * handed to a list's fields, columns or omissions, or to a query's
 * `values(fields: ...)`.
 */
const KEY_PROPERTY_LIST =
  /\b(?:fields|columns|omits|tableOmits)\s*[:=]\s*\{?\s*\[\s*["'`]|\bvalues\(fields:\s*\[/;

/** Whether a source path is code the app ships, not a test or a recording. */
const isShippedSource = (path: string): boolean =>
  /\.tsx?$/.test(path) &&
  !/\.(?:tests|stories)\.tsx?$/.test(path) &&
  !/(?:^|\/)(?:__generated__|__fixtures__)\//.test(path);

describe("the app's lists", () => {
  it("name their key properties only in the lens", () => {
    const offenders = readdirSync(SOURCE_ROOT, { recursive: true })
      .map(String)
      .filter(isShippedSource)
      .filter((path) => !LENS_FILES.includes(path))
      .filter((path) =>
        KEY_PROPERTY_LIST.test(readFileSync(join(SOURCE_ROOT, path), "utf8")),
      );
    expect(offenders).toEqual([]);
  });

  it.each(INDEX_LISTS)("%s draws its nodes through NodeList", (path) => {
    expect(readFileSync(join(SOURCE_ROOT, path), "utf8")).toMatch(
      /<NodeList\b/,
    );
  });
});
