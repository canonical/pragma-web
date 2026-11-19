// @vitest-environment node

import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertAnatomy,
  assertProjectionMatchesFragment,
  assertScaffold,
  assertStylesheets,
  assertStylesMatchAnatomy,
  listAnatomyFolders,
} from "@canonical/prism-core/testing";
import type { ConcreteRequest, ReaderFragment } from "relay-runtime";
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

/**
 * The compiled operation of every peek, by its component's name: a peek
 * runs a query of its own, read by its operation's root fragment.
 */
const PEEK_FRAGMENTS = new Map(
  Object.entries(
    import.meta.glob<ConcreteRequest>(
      "../../__generated__/*PeekQuery.graphql.ts",
      { eager: true, import: "default" },
    ),
  ).map(([path, request]) => [
    basename(path, ".graphql.ts").replace(/Query$/, ""),
    request.fragment,
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
  "--color-background-container",
  "--color-background-layer2",
  "--color-border",
  "--color-border-muted",
  "--color-focus-ring",
  "--color-foreground-ghost-hover",
  "--color-foreground-secondary",
  "--color-text-muted",
  "--popover-border-width",
  "--popover-color-border",
  "--popover-padding-horizontal",
  "--popover-padding-vertical",
  "--typography-text-primary-bold-font-weight",
  "--typography-text-primary-font-size",
  "--typography-text-primary-font-weight",
  "--typography-text-primary-smallcaps-letter-spacing",
];

const folders = listAnatomyFolders([UI_DIRECTORY]);

/**
 * The subcomponents, each in its parent's `common/` folder. The scaffold
 * check places a component only under `src/lib/ui` or a subject folder, so
 * these keep their anatomy and their styles, not that check.
 */
const subcomponentFolders = listAnatomyFolders(
  folders.map((folder) => join(folder, "common")),
);

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
      "EntityTable",
      "SwatchMark",
      "TokenMark",
      "TokenSwatch",
    ]);
  });

  it("and the projections and dispatchers, each under its type's subject folder", () => {
    expect(projectionFolders.map((folder) => basename(folder))).toEqual([
      "CardProjection",
      "ChipProjection",
      "CommandProjection",
      "GraphNodeProjection",
      "NodeCard",
      "NodeChip",
      "NodeCommand",
      "NodeGraphNode",
      "NodeList",
      "NodeRow",
      "ProjectionPeek",
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

  it("and the subcomponents: the card's specimen and the chip's peek", () => {
    expect(subcomponentFolders.map((folder) => basename(folder))).toEqual([
      "Specimen",
      "Peek",
    ]);
  });

  for (const folder of subcomponentFolders) {
    it(`${basename(folder)} keeps its anatomy and its styles`, () => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
    });
  }

  for (const folder of projectionFolders) {
    it(`${basename(folder)} reads what its anatomy projects`, () => {
      const fragment =
        FRAGMENTS.get(basename(folder)) ?? PEEK_FRAGMENTS.get(basename(folder));
      if (fragment === undefined) {
        throw new Error(`${basename(folder)} has no compiled fragment`);
      }
      assertProjectionMatchesFragment(assertAnatomy(folder), fragment);
    });
  }
});

/**
 * The tokens the projections read beyond the shim: the peek's address line
 * is muted, takes the published Card's content insets and paints the
 * background a scrolled card passes under.
 */
const PROJECTION_TOKENS = [
  "--card-content-padding-block-end",
  "--card-content-padding-inline",
  "--color-background",
  "--color-text-muted",
];

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
        assertStylesheets({
          directory,
          layer: "ds.components.global",
          externalTokens: PROJECTION_TOKENS,
        }),
      ).not.toThrow();
    });
  }
});
