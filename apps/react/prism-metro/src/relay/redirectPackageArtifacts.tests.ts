// @vitest-environment node

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import redirectPackageArtifacts from "./redirectPackageArtifacts.js";

/** The app's root, two levels up from this file. */
const APP_ROOT = fileURLToPath(new URL("../..", import.meta.url)).replace(
  /\/$/,
  "",
);

/** The repository's root, where the app's Relay configuration is rooted. */
const REPOSITORY_ROOT = join(APP_ROOT, "..", "..", "..");

/** A module of the projections package, which the app compiles. */
const PACKAGE_IMPORTER = join(
  REPOSITORY_ROOT,
  "packages/prism/projections/src/lib/node/CardProjection/CardProjection.tsx",
);

/** The import that module makes of its own compiled fragment. */
const PACKAGE_ARTIFACT =
  "../../../__generated__/CardProjection_node.graphql.js";

/**
 * Run the plugin's `resolveId` hook over `source` imported from `importer`,
 * as the bundler does: only when its filter takes the import.
 */
function resolveImport(
  plugin: Plugin,
  source: string,
  importer: string | undefined,
): unknown {
  const hook = plugin.resolveId;
  if (typeof hook !== "object" || !(hook.filter?.id instanceof RegExp)) {
    throw new Error("the plugin has no filtered resolveId hook");
  }
  if (!hook.filter.id.test(source)) return null;
  return Reflect.apply(hook.handler, {}, [
    source,
    importer,
    { isEntry: false },
  ]);
}

/** The plugin over the app's own Relay configuration. */
const plugin = redirectPackageArtifacts({
  appRoot: APP_ROOT,
  relayConfig: join(APP_ROOT, "relay.config.json"),
});

/** A directory of the system's, emptied after each test. */
let directory: string;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "redirect-package-artifacts-"));
});

afterEach(() => {
  rmSync(directory, { recursive: true });
});

/**
 * Write `config` as a `relay.config.json` in the test's directory, and
 * return its path.
 *
 * @note Impure: writes to the file system.
 */
function writeRelayConfig(config: object): string {
  const path = join(directory, "relay.config.json");
  writeFileSync(path, JSON.stringify(config));
  return path;
}

describe("redirectPackageArtifacts", () => {
  it("runs before Vite's own resolution", () => {
    expect(plugin.enforce).toBe("pre");
  });

  it("redirects a listed package's artifact to the app's compile", () => {
    expect(resolveImport(plugin, PACKAGE_ARTIFACT, PACKAGE_IMPORTER)).toBe(
      join(APP_ROOT, "src/relay/__generated__/CardProjection_node.graphql.ts"),
    );
  });

  it("reads the importer's path without its query", () => {
    expect(
      resolveImport(plugin, PACKAGE_ARTIFACT, `${PACKAGE_IMPORTER}?v=1`),
    ).toBe(
      join(APP_ROOT, "src/relay/__generated__/CardProjection_node.graphql.ts"),
    );
  });

  it("leaves the app's own imports to Vite", () => {
    expect(
      resolveImport(
        plugin,
        "./__generated__/MetroHomeQuery.graphql.js",
        join(APP_ROOT, "src/relay/index.ts"),
      ),
    ).toBeNull();
  });

  it("leaves a package's other imports to Vite", () => {
    expect(
      resolveImport(plugin, "../../ui/index.js", PACKAGE_IMPORTER),
    ).toBeNull();
  });

  it("leaves an entry, which has no importer, to Vite", () => {
    expect(resolveImport(plugin, PACKAGE_ARTIFACT, undefined)).toBeNull();
  });

  it("names an artifact the app's compile has not written", () => {
    expect(() =>
      resolveImport(
        plugin,
        "../../../__generated__/MissingProjection_node.graphql.js",
        PACKAGE_IMPORTER,
      ),
    ).toThrow(/MissingProjection_node\.graphql.*bun run relay/);
  });

  it("reads sources relative to the configuration without a root", () => {
    const relayConfig = writeRelayConfig({
      sources: { src: "site", vendor: "site" },
      projects: { site: { output: "src/__generated__" } },
    });
    const rooted = redirectPackageArtifacts({
      appRoot: directory,
      relayConfig,
    });
    expect(() =>
      resolveImport(rooted, PACKAGE_ARTIFACT, join(directory, "vendor/a.ts")),
    ).toThrow(join(directory, "src/__generated__"));
  });

  it("refuses a configuration that does not compile the app", () => {
    const relayConfig = writeRelayConfig({
      sources: { elsewhere: "site" },
      projects: { site: { output: "out" } },
    });
    expect(() =>
      redirectPackageArtifacts({ appRoot: APP_ROOT, relayConfig }),
    ).toThrow("compiles no project");
  });

  it("refuses a configuration whose project is not declared", () => {
    const relayConfig = writeRelayConfig({
      sources: { src: "site" },
      projects: {},
    });
    expect(() =>
      redirectPackageArtifacts({ appRoot: directory, relayConfig }),
    ).toThrow("compiles no project");
  });
});
