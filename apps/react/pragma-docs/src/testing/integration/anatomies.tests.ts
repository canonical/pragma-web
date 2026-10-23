// @vitest-environment node

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertAnatomy,
  assertScaffold,
  assertStylesheets,
  assertStylesMatchAnatomy,
  listAnatomyFolders,
} from "@canonical/prism-core/testing";
import { describe, expect, it } from "vitest";

/** The app's root, three levels up from this file. */
const APP_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Where the app's general components live. */
const UI_DIRECTORY = join(APP_ROOT, "src", "lib", "ui");

/** Where each domain's own components live: `src/domains/<subject>/lib`. */
const DOMAIN_LIBRARIES = readdirSync(join(APP_ROOT, "src", "domains"), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(APP_ROOT, "src", "domains", entry.name, "lib"));

/** The semantic tokens the app's components read beyond the shim. */
const EXTERNAL_TOKENS = [
  "--color-background",
  "--color-text",
  "--color-text-muted",
  "--typography-text-secondary-font-size",
];

/**
 * The document tokens the shell declares on `:root`: the intrinsic grid's
 * column floor, at the scope the grid preset reads it.
 */
const DOCUMENT_TOKENS = ["--grid-col-min"];

const folders = listAnatomyFolders([UI_DIRECTORY, ...DOMAIN_LIBRARIES]);

describe("the app's components", () => {
  it("are found, the shell among them", () => {
    expect(folders).toContain(join(UI_DIRECTORY, "Shell"));
  });

  it.each(folders)(
    "%s keeps its anatomy, its styles and its scaffold",
    (folder) => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: APP_ROOT, testSuffix: "tests" });
    },
  );

  it("keep the design's token and grid rules in their stylesheets", () => {
    expect(() =>
      assertStylesheets({
        directory: UI_DIRECTORY,
        layer: "ds.components.global",
        externalTokens: EXTERNAL_TOKENS,
        documentTokens: DOCUMENT_TOKENS,
      }),
    ).not.toThrow();
  });
});
