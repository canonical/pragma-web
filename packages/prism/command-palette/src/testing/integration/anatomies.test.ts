// @vitest-environment node

import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertAnatomy,
  assertScaffold,
  assertStylesMatchAnatomy,
  listAnatomyFolders,
} from "@canonical/prism-core/testing";
import { describe, expect, it } from "vitest";

/** The package's root, three levels up from this file. */
const PACKAGE_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Where the package's components live. */
const UI_DIRECTORY = fileURLToPath(new URL("../../lib/ui", import.meta.url));

const folders = listAnatomyFolders([UI_DIRECTORY]);

describe("the package's components", () => {
  it("are the palette's parts, each under src/lib/ui", () => {
    expect(folders.map((folder) => basename(folder))).toEqual([
      "CommandPaletteTitle",
    ]);
  });

  for (const folder of folders) {
    it(`${basename(folder)} keeps its anatomy, its styles and its scaffold`, () => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: PACKAGE_ROOT, testSuffix: "test" });
    });
  }
});
