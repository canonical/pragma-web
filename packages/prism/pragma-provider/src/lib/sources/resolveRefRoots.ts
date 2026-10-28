/**
 * Resolving the ref packages to directories on disk.
 *
 * The ref packages are dependencies of this package: `design-system`,
 * `code-standards` and `anatomy-dsl` published on npm and pinned to exact
 * versions, `surface` and `design-system-docs` linked from this repository's
 * private shims. The default resolution therefore reads them all from
 * `node_modules`, the way any other dependency is read: `bun install` is the
 * whole setup, the versions are in `package.json` where Renovate bumps them,
 * and two machines with the same lockfile compile the same graph.
 *
 * A private package names no release. Its manifest's version is the
 * workspace's, which the release tool bumps on every release whether the
 * package changed or not, so it is read as unversioned: otherwise each
 * release would stale the `revision` line of the docsite's committed schema
 * without a change to the graph.
 *
 * The pragma CLI's refs cache (`pragma sources update`) stays available as an
 * override, through `PRAGMA_REFS_DIR` or the `refsRoot` option, for work
 * against ontology branches that are not published yet. It replaces where the
 * packages are read from, never which packages the graph holds: a cache that
 * lacks a package of the demand model is refused. Its layout differs
 * from a package's (`<package>/main/{definitions,data}` rather than
 * `<package>/{definitions,data}`), which is why resolution produces a list of
 * {@link RefRoot}s rather than one root directory: the collector never needs
 * to know which layout it is walking.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEMAND_MODEL_PACKAGES,
  REF_NAME,
  REF_PACKAGES,
  REF_SCOPE,
  type RefRoot,
} from "../config/index.js";

/**
 * Find an installed package by walking up from `from` through every
 * `node_modules` on the way to the filesystem root, the way Node resolves a
 * bare specifier. Returns the package directory, or `undefined`.
 *
 * Written out rather than delegated to `import.meta.resolve` because the ref
 * packages do not all export their `package.json` (`anatomy-dsl` exports `.`
 * and `./definitions/*` only), and a resolver that goes through `exports`
 * would refuse the lookup for exactly the packages it is meant to find.
 */
export const findInstalledPackage = (
  name: string,
  from: string,
): string | undefined => {
  let dir = from;
  for (;;) {
    const candidate = join(dir, "node_modules", name);
    if (existsSync(join(candidate, "package.json"))) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
};

/**
 * The release a package directory declares, if it carries the manifest of a
 * published package. A manifest marked `private` names no release.
 */
const readVersion = (dir: string): string | undefined => {
  const manifest = join(dir, "package.json");
  if (!existsSync(manifest)) return undefined;
  const parsed: unknown = JSON.parse(readFileSync(manifest, "utf-8"));
  const { private: unpublished, version } = parsed as {
    private?: unknown;
    version?: unknown;
  };
  if (unpublished === true) return undefined;
  return typeof version === "string" ? version : undefined;
};

/** Attach the version each root's manifest declares, where there is one. */
const withVersions = (roots: readonly RefRoot[]): RefRoot[] =>
  roots.map((root) => {
    const version = readVersion(root.dir);
    return version === undefined ? root : { ...root, version };
  });

/**
 * The ref packages as installed next to this package.
 *
 * `from` is the file to start the walk at; it defaults to this module, so the
 * walk finds this package's own `node_modules` first. Throws, naming the
 * package, when one is not installed: a dependency that is missing after
 * `bun install` is a broken install, not a graph with fewer sources.
 */
export const installedRefRoots = (
  from: string = fileURLToPath(import.meta.url),
): RefRoot[] =>
  withVersions(
    REF_PACKAGES.map((pkg) => {
      const name = `${REF_SCOPE}/${pkg}`;
      const dir = findInstalledPackage(name, from);
      if (dir === undefined) {
        throw new Error(
          `${name} is not installed next to @canonical/prism-pragma-provider — run \`bun install\`, or point PRAGMA_REFS_DIR at a pragma refs cache.`,
        );
      }
      return { package: pkg, dir };
    }),
  );

/**
 * The ref packages as the pragma CLI caches them: `<refsRoot>/<package>/main`.
 *
 * Throws when the cache root itself is missing, with the remedy in the
 * message, and when the cache lacks a package of the demand model
 * ({@link DEMAND_MODEL_PACKAGES}), naming the package: the demand model is in
 * every graph, so a cache without it is an incomplete cache, not a smaller
 * graph. A published package absent from an existing cache is tolerated (it
 * is the state a partially populated cache is in) and contributes nothing;
 * the collector reports the case where nothing at all was found.
 */
export const cacheRefRoots = (refsRoot: string): RefRoot[] => {
  if (!existsSync(refsRoot)) {
    throw new Error(
      `pragma refs cache not found at ${refsRoot} — run \`pragma sources update\` (or set PRAGMA_REFS_DIR).`,
    );
  }
  const missing = DEMAND_MODEL_PACKAGES.find(
    (pkg) => !existsSync(join(refsRoot, pkg, REF_NAME)),
  );
  if (missing !== undefined) {
    throw new Error(
      `${REF_SCOPE}/${missing} is missing from the pragma refs cache at ${refsRoot} — link the shim from packages/prism/semantics/${missing} as ${missing}/${REF_NAME}: the demand model is in every graph.`,
    );
  }
  return withVersions(
    REF_PACKAGES.map((pkg) => ({
      package: pkg,
      dir: join(refsRoot, pkg, REF_NAME),
    })),
  );
};

/**
 * The refs cache named by the environment, if any.
 *
 * `undefined` means "use the installed packages"; there is no cache default
 * any more, because the installed packages are always there after an install
 * and a cache path that happens to exist on one machine is exactly the
 * unstated input this package exists to remove.
 */
export const resolveRefsRoot = (): string | undefined =>
  process.env.PRAGMA_REFS_DIR;

/**
 * Resolve the ref roots: an explicit cache root wins, then `PRAGMA_REFS_DIR`,
 * then the installed packages.
 */
export const resolveRefRoots = (refsRoot?: string): RefRoot[] => {
  const cache = refsRoot ?? resolveRefsRoot();
  return cache === undefined ? installedRefRoots() : cacheRefRoots(cache);
};

/**
 * One line naming every root and its version — the `revision` stamped into
 * the emitted SDL's provenance header, so a schema diff says which package
 * release produced it. A root without a manifest, or with the manifest of a
 * private package such as the demand model's shims, reads as `unversioned`.
 */
export const describeRefRoots = (roots: readonly RefRoot[]): string =>
  roots
    .map((root) => `${root.package}@${root.version ?? "unversioned"}`)
    .join(" ");
