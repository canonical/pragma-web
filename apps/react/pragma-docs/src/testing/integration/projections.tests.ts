// @vitest-environment node

import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertAnatomy,
  assertProjectionMatchesFragment,
  listAnatomyFolders,
} from "@canonical/prism-core/testing";
import type { ReaderFragment } from "relay-runtime";
import { describe, expect, it } from "vitest";

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
  "../../relay/__generated__/*_node.graphql.ts",
  { eager: true },
);

/**
 * Read the compiled fragment a component's projection reads, `<Name>_node`.
 *
 * @throws When the app compiled no such fragment.
 */
function readNodeFragment(folder: string): ReaderFragment {
  const path = `../../relay/__generated__/${basename(folder)}_node.graphql.ts`;
  const fragment = FRAGMENT_MODULES[path]?.default;
  if (fragment === undefined) {
    throw new Error(`${folder}: the app compiled no ${basename(folder)}_node`);
  }
  return fragment;
}

/** The app's projections: every component whose anatomy projects on a type. */
const PROJECTIONS = listAnatomyFolders([
  join(APP_ROOT, "src", "lib", "ui"),
  ...DOMAIN_LIBRARIES,
]).filter((folder) => assertAnatomy(folder).root.projection?.on !== undefined);

describe("the app's projections", () => {
  it("are found in its domain libraries and its general components", () => {
    expect(PROJECTIONS.map((folder) => basename(folder)).sort()).toEqual([
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
      "UIBlockCard",
      "UIBlockChip",
      "UIBlockCommand",
      "UIBlockGraphNode",
      "UIBlockRow",
    ]);
  });

  it.each(PROJECTIONS)("%s reads what its fragment reads", (folder) => {
    assertProjectionMatchesFragment(
      assertAnatomy(folder),
      readNodeFragment(folder),
    );
  });
});
