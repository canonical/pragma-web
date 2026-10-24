// @vitest-environment node

import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertAnatomy,
  assertProjectionMatchesFragment,
  listAnatomyFolders,
} from "@canonical/prism-core/testing";
import type { ReaderFragment, ReaderSelection } from "relay-runtime";
import { describe, expect, it } from "vitest";
import { siteProjectionMaps } from "../../lib/ui/constants.js";
import type { SiteProjectionMaps } from "../../lib/ui/types.js";

/** The app's root, three levels up from this file. */
const APP_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Where each domain's own components live: `src/domains/<subject>/lib`. */
const DOMAIN_LIBRARIES = readdirSync(join(APP_ROOT, "src", "domains"), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(APP_ROOT, "src", "domains", entry.name, "lib"));

/** Every compiled fragment of the app, by the artifact's file name. */
const FRAGMENT_MODULES = import.meta.glob<{ default: ReaderFragment }>(
  [
    "../../relay/__generated__/*_node.graphql.ts",
    "../../relay/__generated__/*_query.graphql.ts",
  ],
  { eager: true },
);

/**
 * Read the compiled fragment a component's projection reads: `<Name>_query`
 * for a projection on the root `Query` type, `<Name>_node` for any other.
 *
 * @throws When the app compiled no such fragment.
 */
function readNodeFragment(folder: string, on?: string): ReaderFragment {
  const name = `${basename(folder)}_${on === "Query" ? "query" : "node"}`;
  const path = `../../relay/__generated__/${name}.graphql.ts`;
  const fragment = FRAGMENT_MODULES[path]?.default;
  if (fragment === undefined) {
    throw new Error(`${folder}: the app compiled no ${name}`);
  }
  return fragment;
}

/** A connection handle's field name, as relay-compiler names `@connection`'s. */
const CONNECTION_HANDLE = /^__\w+_connection$/;

/**
 * Strip what `@connection` adds to a selection: a connection's handle field
 * reads as the field it handles (its alias), with neither the page info nor
 * each edge's cursor that the directive selects for the paginator. An
 * anatomy names the connection's field and never its mechanism.
 */
function stripConnectionMechanics(
  selections: readonly ReaderSelection[],
  inConnection = false,
): ReaderSelection[] {
  return selections.flatMap((selection): ReaderSelection[] => {
    if (selection.kind === "ScalarField") {
      return inConnection && selection.name === "cursor" ? [] : [selection];
    }
    if (selection.kind !== "LinkedField") return [selection];
    const isHandle =
      CONNECTION_HANDLE.test(selection.name) && selection.alias !== null;
    if (inConnection && selection.name === "pageInfo") return [];
    return [
      {
        ...selection,
        name: isHandle ? (selection.alias ?? selection.name) : selection.name,
        selections: stripConnectionMechanics(
          selection.selections,
          isHandle || (inConnection && selection.name === "edges"),
        ),
      },
    ];
  });
}

/**
 * An arm of a site composite, as relay-compiler emits an `@alias` on an
 * inline fragment or a spread: relay-runtime's reader types do not name
 * this selection yet.
 */
interface AliasedArm {
  readonly kind: "AliasedInlineFragmentSpread";
  readonly name: string;
  readonly fragment: {
    readonly type: string;
    readonly selections: readonly ReaderSelection[];
  };
}

/** Whether a selection is an aliased arm. */
function isAliasedArm(selection: object): selection is AliasedArm {
  return (
    "kind" in selection && selection.kind === "AliasedInlineFragmentSpread"
  );
}

/** Name a selection's kind, for a refusal. */
function describeKind(selection: object): string {
  return "kind" in selection ? String(selection.kind) : "a selection";
}

/**
 * Read a site composite's arms: every top-level selection but the typename
 * must be an aliased inline fragment named by the type it is on, so each
 * arm's key is non-null for its own type alone.
 *
 * @returns Each alias, with the fragments its arm spreads.
 * @throws With the first selection that is no such arm.
 */
function readCompositeArms(
  fragment: ReaderFragment,
): Map<string, readonly string[]> {
  const selections: readonly object[] = fragment.selections;
  return new Map(
    selections
      .filter(
        (selection) =>
          !("name" in selection && selection.name === "__typename"),
      )
      .map((selection) => {
        if (
          !isAliasedArm(selection) ||
          selection.name !== selection.fragment.type
        ) {
          throw new Error(
            `${fragment.name}: ${describeKind(selection)} is not an arm aliased by its type`,
          );
        }
        return [
          selection.name,
          selection.fragment.selections.flatMap((inner) =>
            inner.kind === "FragmentSpread" ? [inner.name] : [],
          ),
        ];
      }),
  );
}

/** The site's dispatcher of each form, by the form's key in its maps. */
const SITE_DISPATCHERS: readonly (readonly [
  keyof SiteProjectionMaps,
  string,
])[] = [
  ["chip", "Chip"],
  ["row", "Row"],
  ["card", "Card"],
  ["command", "Command"],
  ["graphNode", "GraphNode"],
];

/** The app's component folders, with their private subcomponents. */
const COMPONENT_FOLDERS = listAnatomyFolders([
  join(APP_ROOT, "src", "lib", "ui"),
  ...DOMAIN_LIBRARIES,
]);

/**
 * The app's projections: every component, or private subcomponent in its
 * parent's `common/` folder, whose anatomy projects on a type.
 */
const PROJECTIONS = [
  ...COMPONENT_FOLDERS,
  ...listAnatomyFolders(
    COMPONENT_FOLDERS.map((folder) => join(folder, "common")),
  ),
].filter((folder) => assertAnatomy(folder).root.projection?.on !== undefined);

describe("the app's projections", () => {
  it("are found in its domain libraries and its general components", () => {
    expect(PROJECTIONS.map((folder) => basename(folder)).sort()).toEqual([
      "CatalogList",
      "CodeStandardCard",
      "CodeStandardChip",
      "CodeStandardCommand",
      "CodeStandardGraphNode",
      "CodeStandardRow",
      "ComponentAnatomy",
      "ComponentHeader",
      "ComponentProperties",
      "ComponentRelations",
      "ModifierCard",
      "ModifierChip",
      "ModifierCommand",
      "ModifierFamilyCard",
      "ModifierFamilyChip",
      "ModifierFamilyCommand",
      "ModifierFamilyGraphNode",
      "ModifierFamilyRow",
      "ModifierGraphNode",
      "ModifierRow",
      "SiteCardProjection",
      "SiteChipProjection",
      "SiteCommandProjection",
      "SiteGraphNodeProjection",
      "SiteRowProjection",
      "UIBlockCard",
      "UIBlockChip",
      "UIBlockCommand",
      "UIBlockGraphNode",
      "UIBlockRow",
    ]);
  });

  it.each(PROJECTIONS)("%s reads what its fragment reads", (folder) => {
    const specification = assertAnatomy(folder);
    const fragment = readNodeFragment(
      folder,
      specification.root.projection?.on,
    );
    assertProjectionMatchesFragment(specification, {
      ...fragment,
      selections: stripConnectionMechanics(fragment.selections),
    });
  });
});

describe("the site's composites", () => {
  it.each(SITE_DISPATCHERS)(
    "the %s composite arms exactly what its map and its anatomy arm",
    (form, word) => {
      const name = `Site${word}Projection`;
      const arms = readCompositeArms(
        readNodeFragment(join(APP_ROOT, "src", "lib", "ui", name)),
      );
      expect(arms.get("Node")).toEqual([`${word}Projection_node`]);
      const types = siteProjectionMaps[form].types;
      const typed = [...arms.keys()].filter((alias) => alias !== "Node");
      expect(typed.sort()).toEqual(Object.keys(types).sort());
      for (const [alias, Arm] of Object.entries(types)) {
        expect(arms.get(alias), alias).toEqual([`${Arm.name}_node`]);
      }
      const { root } = assertAnatomy(join(APP_ROOT, "src", "lib", "ui", name));
      const cases = (root.edges ?? []).flatMap(({ target }) =>
        "cases" in target
          ? target.cases.map(({ node }) => node.projection?.on)
          : [],
      );
      expect(cases.filter((on) => on !== "Node").sort()).toEqual(typed.sort());
    },
  );

  it("refuses an arm spread without an alias", () => {
    expect(() =>
      readCompositeArms({
        kind: "Fragment",
        name: "Unaliased_node",
        type: "Node",
        metadata: null,
        argumentDefinitions: [],
        selections: [
          { kind: "ScalarField", name: "__typename" },
          { kind: "FragmentSpread", name: "ModifierCard_node", args: null },
        ],
      }),
    ).toThrow(
      /Unaliased_node: FragmentSpread is not an arm aliased by its type/,
    );
  });
});
