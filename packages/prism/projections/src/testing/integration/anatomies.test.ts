// @vitest-environment node

import { basename } from "node:path";
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

/** Where the package's generic representations live. */
const UI_DIRECTORY = fileURLToPath(new URL("../../lib/ui", import.meta.url));

/** Where the `Node` arms live, still in the package's own layer. */
const NODE_DIRECTORY = fileURLToPath(
  new URL("../../lib/node", import.meta.url),
);

/** The semantic tokens the `Node` arms read beyond the shim. */
const NODE_TOKENS = ["--color-border-muted", "--color-text-muted"];

/** The semantic tokens the generic representations read beyond the shim. */
const UI_TOKENS = [
  "--card-span",
  "--color-background",
  "--color-background-layer2",
  "--color-border",
  "--color-border-muted",
  "--color-focus-ring",
  "--color-foreground-ghost-hover",
  "--color-foreground-secondary",
  "--color-text-muted",
  "--typography-text-primary-bold-font-weight",
  "--typography-text-primary-font-size",
  "--typography-text-primary-font-weight",
  "--typography-text-primary-smallcaps-letter-spacing",
];

const folders = listAnatomyFolders([UI_DIRECTORY]);

describe("the package's components", () => {
  it("are the generic representations, each under src/lib/ui", () => {
    expect(folders.map((folder) => basename(folder))).toEqual([
      "EntityCard",
      "EntityChip",
      "EntityCommand",
      "EntityGraphNode",
      "EntityList",
      "EntityRow",
    ]);
  });

  for (const folder of folders) {
    it(`${basename(folder)} keeps its anatomy, its styles and its scaffold`, () => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: PACKAGE_ROOT, testSuffix: "test" });
    });
  }
});

describe("the package's stylesheets", () => {
  it("keep the design's token and grid rules in the generic representations", () => {
    expect(() =>
      assertStylesheets({
        directory: UI_DIRECTORY,
        layer: "ds.components.global",
        externalTokens: UI_TOKENS,
      }),
    ).not.toThrow();
  });

  it("keep the design's token and grid rules in the Node arms", () => {
    expect(() =>
      assertStylesheets({
        directory: NODE_DIRECTORY,
        layer: "ds.prism",
        externalTokens: NODE_TOKENS,
      }),
    ).not.toThrow();
  });
});
