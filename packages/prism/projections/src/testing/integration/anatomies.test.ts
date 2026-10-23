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
import type { ReaderFragment } from "relay-runtime";
import { describe, expect, it } from "vitest";

/** The package's root, three levels up from this file. */
const PACKAGE_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Where the package's generic representations live. */
const UI_DIRECTORY = fileURLToPath(new URL("../../lib/ui", import.meta.url));

/** Where the projections of the contract's ontology types live. */
const ONTOLOGY_DIRECTORY = fileURLToPath(
  new URL("../../lib/ontology", import.meta.url),
);

/** The compiled fragment of every projection, by its component's name. */
const FRAGMENTS = new Map(
  Object.entries(
    import.meta.glob<ReaderFragment>("../../__generated__/*_node.graphql.ts", {
      eager: true,
      import: "default",
    }),
  ).map(([path, fragment]) => [
    basename(path, ".graphql.ts").replace(/_node$/, ""),
    fragment,
  ]),
);

/** Where the projections of any node and the dispatchers live. */
const NODE_DIRECTORY = fileURLToPath(
  new URL("../../lib/node", import.meta.url),
);

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

const projectionFolders = listAnatomyFolders([
  NODE_DIRECTORY,
  ONTOLOGY_DIRECTORY,
]);

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

  it("and the projections and dispatchers, each under its type's subject folder", () => {
    expect(projectionFolders.map((folder) => basename(folder))).toEqual([
      "CardProjection",
      "ChipProjection",
      "CommandProjection",
      "NodeCard",
      "NodeChip",
      "NodeCommand",
      "NodeGraphNode",
      "NodeRow",
      "RowProjection",
      "OntologyClassCard",
      "OntologyClassChip",
      "OntologyClassCommand",
      "OntologyClassGraphNode",
      "OntologyClassRow",
      "OntologyPropertyCard",
      "OntologyPropertyChip",
      "OntologyPropertyCommand",
      "OntologyPropertyGraphNode",
      "OntologyPropertyRow",
    ]);
  });

  for (const folder of [...folders, ...projectionFolders]) {
    it(`${basename(folder)} keeps its anatomy, its styles and its scaffold`, () => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: PACKAGE_ROOT, testSuffix: "test" });
    });
  }

  for (const folder of projectionFolders) {
    it(`${basename(folder)} reads what its anatomy projects`, () => {
      const fragment = FRAGMENTS.get(basename(folder));
      if (fragment === undefined) {
        throw new Error(`${basename(folder)} has no compiled fragment`);
      }
      assertProjectionMatchesFragment(assertAnatomy(folder), fragment);
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

  for (const directory of [NODE_DIRECTORY, ONTOLOGY_DIRECTORY]) {
    it(`keep the design's token and grid rules in ${basename(directory)}'s projections`, () => {
      expect(() =>
        assertStylesheets({ directory, layer: "ds.components.global" }),
      ).not.toThrow();
    });
  }
});
