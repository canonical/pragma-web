// @vitest-environment node

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

/** Where the lens's re-scaffolded components live. */
const UI_DIRECTORY = fileURLToPath(new URL("../../lib/ui", import.meta.url));

const folders = listAnatomyFolders([UI_DIRECTORY]);

describe("the lens's components", () => {
  it("are listed from src/lib/ui, where each carries its anatomy", () => {
    expect(Array.isArray(folders)).toBe(true);
  });

  for (const folder of folders) {
    it(`${folder} keeps its anatomy, its styles and its scaffold`, () => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: PACKAGE_ROOT, testSuffix: "test" });
    });
  }
});
