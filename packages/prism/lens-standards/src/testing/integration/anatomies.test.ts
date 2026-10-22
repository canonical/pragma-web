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
  // The lens's components still sit directly under src/lib, with no anatomy
  // and no stories, and none has been scaffolded under src/lib/ui yet; their
  // stylesheets are held to the lens's own stylesheet census meanwhile. The
  // list is pinned empty, so the first component scaffolded under src/lib/ui
  // fails here until this expectation names it, and from then on every one is
  // checked below.
  it("are none under src/lib/ui yet", () => {
    expect(folders).toEqual([]);
  });

  for (const folder of folders) {
    it(`${folder} keeps its anatomy, its styles and its scaffold`, () => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: PACKAGE_ROOT, testSuffix: "test" });
    });
  }
});
