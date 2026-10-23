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

/** The semantic tokens the components' tokens bind beyond the shim. */
const EXTERNAL_TOKENS = ["--color-text-muted"];

const folders = listAnatomyFolders([UI_DIRECTORY]);

/**
 * The private subcomponents, each in its parent's `common/` folder. The
 * scaffold check places a component only under `src/lib/ui`, so these keep
 * their anatomy and their styles, not that check.
 */
const subcomponentFolders = listAnatomyFolders(
  folders.map((folder) => join(folder, "common")),
);

describe("the lens's components", () => {
  it("are every component of the lens, each under src/lib/ui", () => {
    expect(folders.map((folder) => basename(folder))).toEqual([
      "StandardArticle",
      "StandardReadingPage",
      "StandardsIcon",
      "StandardsIndex",
      "StandardsLayout",
      "StandardsPage",
    ]);
  });

  it("have their subcomponents found in their parents' common folders", () => {
    expect(subcomponentFolders.map((folder) => basename(folder))).toEqual([
      "StandardProse",
      "StandardDetail",
      "Trail",
    ]);
  });

  it.each(folders)(
    "%s keeps its anatomy, its styles and its scaffold",
    (folder) => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: PACKAGE_ROOT, testSuffix: "test" });
    },
  );

  it.each(subcomponentFolders)(
    "%s keeps its anatomy and its styles",
    (folder) => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
    },
  );

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
