// @vitest-environment node

import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertAnatomy,
  assertScaffold,
  assertStylesheets,
  assertStylesMatchAnatomy,
  listAnatomyFolders,
} from "@canonical/prism-core/testing";
import { describe, expect, it } from "vitest";

/** The package's root, three levels up from this file. */
const PACKAGE_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Where the lens's components live. */
const UI_DIRECTORY = fileURLToPath(new URL("../../lib/ui", import.meta.url));

/**
 * The semantic tokens the lens's stylesheets read beyond the spacing shim
 * and the density channel: the colours and the text styles of the
 * semantic tier.
 */
const EXTERNAL_TOKENS = [
  "--color-background",
  "--color-background-container",
  "--color-background-layer2",
  "--color-border",
  "--color-border-muted",
  "--color-focus-ring",
  "--color-text",
  "--color-text-branded",
  "--color-text-muted",
  "--typography-text-primary-bold-font-weight",
  "--typography-text-primary-code-font-family",
  "--typography-text-primary-font-size",
  "--typography-text-secondary-font-size",
  "--typography-text-secondary-font-weight",
];

/**
 * The component whose folder keeps the shape of a context provider rather
 * than the generator's: a `Context`, a `Provider` and the hooks that read
 * them, with no element, no stylesheet and nothing to show in a story.
 */
const PROVIDERS = ["LensFilterProvider"];

const folders = listAnatomyFolders([UI_DIRECTORY]);

/** The parts each component keeps under its `common/` folder. */
const parts = listAnatomyFolders(
  folders.map((folder) => join(folder, "common")),
);

describe("the lens's components", () => {
  it("are the workspace's, each under src/lib/ui", () => {
    expect(folders.map((folder) => basename(folder))).toEqual([
      "ClassGraph",
      "DefinitionsExplorer",
      "DefinitionsIcon",
      "DefinitionsLayout",
      "DefinitionsPage",
      "ExplorerControls",
      "ExplorerStatus",
      "HierarchyWell",
      "LensFilterProvider",
      "TermInspector",
      "TermRail",
    ]);
  });

  it.each(folders)("%s keeps its anatomy and its styles", (folder) => {
    assertStylesMatchAnatomy(folder, assertAnatomy(folder));
  });

  it.each(folders.filter((folder) => !PROVIDERS.includes(basename(folder))))(
    "%s keeps the generator's scaffold",
    (folder) => {
      assertScaffold(folder, { packageRoot: PACKAGE_ROOT, testSuffix: "test" });
    },
  );

  it.each(parts)("the part %s keeps its anatomy and its styles", (folder) => {
    assertStylesMatchAnatomy(folder, assertAnatomy(folder));
  });

  it("keep the design's token and grid rules in their stylesheets", () => {
    expect(() =>
      assertStylesheets({
        directory: UI_DIRECTORY,
        layer: "ds.components.global",
        externalTokens: EXTERNAL_TOKENS,
      }),
    ).not.toThrow();
  });
});
