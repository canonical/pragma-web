// @vitest-environment node

import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  assertAnatomy,
  assertScaffold,
  assertStylesheets,
  assertStylesMatchAnatomy,
  listAnatomyFolders,
} from "../../../testing/index.js";

/** The package's root, three levels up from this file. */
const PACKAGE_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Where the package's components live. */
const UI_DIRECTORY = fileURLToPath(new URL("../../lib/ui", import.meta.url));

/**
 * The semantic tokens the components read beyond the spacing shim and the
 * density channel: the colours and weights of the semantic tier.
 */
const EXTERNAL_TOKENS = [
  "--color-background",
  "--color-background-layer2",
  "--color-border-muted",
  "--color-brand-primary",
  "--color-focus-ring",
  "--color-text",
  "--color-text-muted",
  "--typography-weight-bold",
  "--typography-weight-medium",
  "--typography-weight-regular",
  "--typography-weight-semi-bold",
];

/**
 * The rules that style markup a component does not write itself: the
 * site's utility cluster at the rail's foot, styled from the class
 * contract `Rail` documents.
 */
const REACHES = [
  ".ds.rail .utilities-label",
  ".ds.rail .utilities",
  ".ds.rail .theme",
];

const folders = listAnatomyFolders([UI_DIRECTORY]);

describe("the package's components", () => {
  it("are found", () => {
    expect(folders.length).toBeGreaterThan(0);
  });

  it.each(folders)(
    "%s keeps its anatomy, its styles and its scaffold",
    (folder) => {
      const specification = assertAnatomy(folder);
      assertStylesMatchAnatomy(folder, specification);
      assertScaffold(folder, { packageRoot: PACKAGE_ROOT, testSuffix: "test" });
    },
  );

  it("keep the design's token and grid rules in their stylesheets", () => {
    expect(() =>
      assertStylesheets({
        directory: UI_DIRECTORY,
        layer: "ds.components.global",
        externalTokens: EXTERNAL_TOKENS,
        reaches: REACHES,
      }),
    ).not.toThrow();
  });
});
