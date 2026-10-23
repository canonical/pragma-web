// @vitest-environment node

import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertAnatomy,
  assertProjectionMatchesFragment,
  assertScaffold,
  assertStylesheets,
  assertStylesMatchAnatomy,
  listAnatomyFolders,
} from "@canonical/prism-core/testing";
import { describe, expect, it } from "vitest";
import resultFragment from "../../__generated__/CommandPaletteResult_node.graphql.js";
import searchQuery from "../../__generated__/CommandPaletteSearchQuery.graphql.js";

/** The package's root, three levels up from this file. */
const PACKAGE_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Where the package's components live. */
const UI_DIRECTORY = fileURLToPath(new URL("../../lib/ui", import.meta.url));

/** The semantic tokens the palette's stylesheets read beyond the shim. */
const EXTERNAL_TOKENS = [
  "--color-border-muted",
  "--color-focus-ring",
  "--color-text-error",
  "--color-text-muted",
  "--grid-col-min",
  "--typography-text-primary-font-size",
  "--typography-text-primary-smallcaps-letter-spacing",
];

const folders = listAnatomyFolders([UI_DIRECTORY]);

/** The folder of a component of the package, by its name. */
const findFolder = (name: string): string => {
  const folder = folders.find((candidate) => basename(candidate) === name);
  if (folder === undefined) throw new Error(`no component folder ${name}`);
  return folder;
};

describe("the package's components", () => {
  it("are the palette's parts, each under src/lib/ui", () => {
    expect(folders.map((folder) => basename(folder))).toEqual([
      "CommandPalette",
      "CommandPaletteResult",
      "CommandPaletteSearch",
      "CommandPaletteTitle",
    ]);
  });

  for (const folder of folders) {
    it(`${basename(folder)} keeps its anatomy, its styles and its scaffold`, () => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: PACKAGE_ROOT, testSuffix: "test" });
    });
  }

  it("CommandPaletteResult reads what its anatomy projects", () => {
    assertProjectionMatchesFragment(
      assertAnatomy(findFolder("CommandPaletteResult")),
      resultFragment,
    );
  });
});

describe("the package's operations", () => {
  it("CommandPaletteSearch's query reads what its anatomy projects", () => {
    assertProjectionMatchesFragment(
      assertAnatomy(findFolder("CommandPaletteSearch")),
      searchQuery.fragment,
    );
  });
});

describe("the package's stylesheets", () => {
  it("keep the design's token and grid rules", () => {
    expect(() =>
      assertStylesheets({
        directory: UI_DIRECTORY,
        layer: "ds.components.global",
        externalTokens: EXTERNAL_TOKENS,
      }),
    ).not.toThrow();
  });
});
