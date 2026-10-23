// @vitest-environment node

import { existsSync } from "node:fs";
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
const EXTERNAL_TOKENS = [
  "--color-background",
  "--color-border-muted",
  "--color-focus-ring",
  "--color-text",
  "--color-text-muted",
  "--typography-text-secondary-font-size",
  "--typography-text-secondary-line-height",
];

/**
 * The context providers among the lens's components. A provider follows
 * its own file structure (cs:react.component.structure.context): its main
 * file is `Provider.tsx`, beside `Context.tsx` and its state hook, with no
 * stylesheet and no stories, so the generator's scaffold check does not
 * apply to it; its own file set is checked instead.
 */
const PROVIDER_NAMES: readonly string[] = ["EntityFilterProvider"];

/** The files a context provider's folder holds. */
const PROVIDER_FILES = [
  "anatomy.yaml",
  "Context.tsx",
  "Provider.tsx",
  "hooks/types.ts",
  "hooks/useProviderState.ts",
  "index.ts",
  "types.ts",
];

const folders = listAnatomyFolders([UI_DIRECTORY]);

/** The lens's components that the generator scaffolds. */
const componentFolders = folders.filter(
  (folder) => !PROVIDER_NAMES.includes(basename(folder)),
);

/** The lens's context providers. */
const providerFolders = folders.filter((folder) =>
  PROVIDER_NAMES.includes(basename(folder)),
);

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
      "EntityFilterProvider",
      "EntityIcon",
      "EntityIndexPage",
      "EntityLayout",
      "EntityPage",
    ]);
  });

  it("have their subcomponents found in their parents' common folders", () => {
    expect(subcomponentFolders.map((folder) => basename(folder))).toEqual([
      "EntityIndex",
      "EntityControls",
      "EntityStatus",
      "SocketGuard",
      "Trail",
      "EntityDetail",
      "EntityHeading",
      "EntitySummary",
      "FieldList",
      "KeyValueList",
      "Relations",
    ]);
  });

  it.each(componentFolders)(
    "%s keeps its anatomy, its styles and its scaffold",
    (folder) => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: PACKAGE_ROOT, testSuffix: "test" });
    },
  );

  it.each(providerFolders)(
    "%s keeps its anatomy and the provider's file structure",
    (folder) => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      expect(
        PROVIDER_FILES.filter((file) => !existsSync(join(folder, file))),
      ).toEqual([]);
      expect(existsSync(join(folder, `${basename(folder)}.tsx`))).toBe(false);
      expect(existsSync(join(folder, "styles.css"))).toBe(false);
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
