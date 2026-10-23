// @vitest-environment node

import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertAnatomy,
  assertProjectionMatchesFragment,
  assertScaffold,
  assertStylesMatchAnatomy,
  listAnatomyFolders,
} from "@canonical/prism-core/testing";
import { describe, expect, it } from "vitest";
import resultFragment from "../../__generated__/CommandPaletteResult_node.graphql.js";

/** The package's root, three levels up from this file. */
const PACKAGE_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Where the package's components live. */
const UI_DIRECTORY = fileURLToPath(new URL("../../lib/ui", import.meta.url));

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
      "CommandPaletteResult",
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
