// @vitest-environment node

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
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

/**
 * Where each domain's own components live, `src/domains/<subject>/lib`, for
 * the domains that have any.
 */
const DOMAIN_LIBRARIES = readdirSync(join(APP_ROOT, "src", "domains"), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(APP_ROOT, "src", "domains", entry.name, "lib"))
  .filter((directory) => existsSync(directory));

/** The semantic tokens the app's components read beyond the shim. */
const EXTERNAL_TOKENS = [
  "--color-background",
  "--color-text",
  "--color-text-muted",
  "--typography-text-primary-bold-font-weight",
  "--typography-text-primary-font-size",
  "--typography-text-primary-line-height",
];

/**
 * The document tokens the shell declares on `:root`: the intrinsic grid's
 * column floor, at the scope the grid preset reads it.
 */
const DOCUMENT_TOKENS = ["--grid-col-min"];

const folders = listAnatomyFolders([UI_DIRECTORY, ...DOMAIN_LIBRARIES]);

/**
 * The private subcomponents, each in its parent's `common/` folder. The
 * scaffold check places a component only under `src/lib/ui` or a domain's
 * `lib`, so these keep their anatomy and their styles, not that check.
 */
const subcomponentFolders = listAnatomyFolders(
  folders.map((folder) => join(folder, "common")),
);

describe("the app's components", () => {
  it("are found, the shell among them", () => {
    expect(folders).toContain(join(UI_DIRECTORY, "Shell"));
  });

  it.each(folders)(
    "%s keeps its anatomy, its styles and its scaffold",
    (folder) => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
      assertScaffold(folder, { packageRoot: APP_ROOT, testSuffix: "tests" });
    },
  );

  it("are found in the domains too, the landing among them", () => {
    expect(folders).toContain(
      join(APP_ROOT, "src", "domains", "metro", "lib", "HomePage"),
    );
  });

  it("have their subcomponents found, the landing's doors among them", () => {
    expect(subcomponentFolders).toContain(
      join(
        APP_ROOT,
        "src",
        "domains",
        "metro",
        "lib",
        "HomePage",
        "common",
        "LensCards",
      ),
    );
  });

  it.each(subcomponentFolders)(
    "%s keeps its anatomy and its styles",
    (folder) => {
      assertStylesMatchAnatomy(folder, assertAnatomy(folder));
    },
  );

  it.each([UI_DIRECTORY, ...DOMAIN_LIBRARIES])(
    "keep the design's token and grid rules in the stylesheets under %s",
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
