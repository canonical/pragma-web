// @vitest-environment node

import { existsSync, readdirSync } from "node:fs";
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

/** The app's root, three levels up from this file. */
const APP_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Where the app's general components live. */
const UI_DIRECTORY = join(APP_ROOT, "src", "lib", "ui");

/** Where each domain's own components live: `src/domains/<subject>/lib`. */
const DOMAIN_LIBRARIES = readdirSync(join(APP_ROOT, "src", "domains"), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(APP_ROOT, "src", "domains", entry.name, "lib"))
  .filter((library) => existsSync(library));

/** The semantic tokens the app's components read beyond the shim. */
const EXTERNAL_TOKENS = [
  "--color-background",
  "--color-background-container",
  "--color-background-layer2",
  "--color-border",
  "--color-border-muted",
  "--color-text",
  "--color-text-branded",
  "--color-text-muted",
  "--typography-text-primary-bold-font-weight",
  "--typography-text-primary-code-font-family",
  "--typography-text-secondary-font-size",
];

/**
 * The document tokens the shell declares on `:root`: the intrinsic grid's
 * column floor, at the scope the grid preset reads it.
 */
const DOCUMENT_TOKENS = ["--grid-col-min"];

/**
 * The context providers among the app's components. A provider follows its
 * own file structure (cs:react.component.structure.context): its main file
 * is `Provider.tsx`, beside `Context.tsx` and its hook, with no stylesheet
 * and no stories, so the generator's scaffold check does not apply to it;
 * it keeps its anatomy.
 */
const PROVIDER_NAMES: readonly string[] = ["JourneyViewProvider"];

const allFolders = listAnatomyFolders([UI_DIRECTORY, ...DOMAIN_LIBRARIES]);

/** The app's components that the generator scaffolds. */
const folders = allFolders.filter(
  (folder) => !PROVIDER_NAMES.includes(basename(folder)),
);

/** The app's context providers. */
const providerFolders = allFolders.filter((folder) =>
  PROVIDER_NAMES.includes(basename(folder)),
);

/**
 * The private subcomponents, each in its parent's `common/` folder. The
 * scaffold check places a component only under `src/lib/ui` or a domain's
 * `lib`, so these keep their anatomy and their styles, not that check.
 */
const subcomponentFolders = listAnatomyFolders(
  allFolders.map((folder) => join(folder, "common")),
);

describe("the app's components", () => {
  it("are found, the shell, a dispatcher and a domain library's among them", () => {
    expect(folders).toContain(join(UI_DIRECTORY, "Shell"));
    expect(folders).toContain(join(UI_DIRECTORY, "SiteCardProjection"));
    expect(folders).toContain(
      join(APP_ROOT, "src", "domains", "components", "lib", "UIBlockCard"),
    );
  });

  it.each(folders)(
    "%s keeps its anatomy, its styles and its scaffold",
    (folder) => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: APP_ROOT, testSuffix: "tests" });
    },
  );

  it.each(subcomponentFolders)(
    "%s keeps its anatomy and its styles",
    (folder) => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
    },
  );

  it.each(providerFolders)("%s keeps its anatomy", (folder) => {
    assertAnatomy(folder);
  });

  it("are found in every domain library", () => {
    expect(DOMAIN_LIBRARIES).toEqual(
      ["components", "modifiers", "standards"].map((domain) =>
        join(APP_ROOT, "src", "domains", domain, "lib"),
      ),
    );
  });

  it.each([UI_DIRECTORY, ...DOMAIN_LIBRARIES])(
    "%s keeps the design's token and grid rules in its stylesheets",
    (directory) => {
      expect(() =>
        assertStylesheets({
          directory,
          layer: "ds.components.global",
          externalTokens: EXTERNAL_TOKENS,
          documentTokens: DOCUMENT_TOKENS,
        }),
      ).not.toThrow();
    },
  );
});
