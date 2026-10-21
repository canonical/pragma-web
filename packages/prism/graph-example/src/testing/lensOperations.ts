/**
 * Harvesting the docsite's lens operations, at RUN time.
 *
 * The operation texts are NEVER snapshotted into this package. They are read
 * out of the lenses' Relay artifacts on every run, so this gate always
 * measures the operations as they are now — not as they were when someone last
 * remembered to update a fixture.
 *
 * Within its scan roots the operation SET is derived from the tree, never from
 * a hand-maintained allowlist. Narrowing that set to the operations that
 * happen to pass is exactly the "shape it until it goes green" failure mode
 * this gate exists to prevent.
 *
 * 🔴 WHAT THE SCAN ROOTS ARE, AND WHAT THEY ARE NOT. The roots are the
 * docsite's `src/domains/lenses` and the `src` of every lens package beside
 * this one (`packages/prism/lens-*`), the core lenses the docsite mounts. They
 * declare FOUR of the docsite's ten shipped query operations, all of them in
 * the lens packages: the app's own lens tree mounts only the Guides stub,
 * which declares none. The other six do
 * not execute against this provider, and it would be dishonest to let the
 * scan roots imply otherwise, so they are named here with the reason:
 *
 *   src/domains/components   CatalogListPaginationQuery, ComponentsCatalogQuery,
 *                            ComponentEntityQuery
 *   src/domains/marketing    LobbyQuery  (the home page)
 *   src/domains/playground   ComponentProbeQuery
 *   src/addons/journeys      JourneysExplorerQuery
 *
 * The first five select `Component` or `Query.component` and the last selects
 * `jobs` — pragma-ontology terms this provider's dataset has no class for, so
 * they fail with "Unknown type" or "Cannot query field". The honest statement
 * of what this gate proves is therefore narrow, and worth stating narrowly:
 * the four core lens operations are provider-neutral. It does NOT establish
 * that the docsite as a whole runs against any conformant provider — five
 * mounted routes, the home page among them, currently do not.
 *
 * Widening the app's root to `src/domains` is the intended direction and would
 * turn this gate red today. That red would be a to-do list rather than a
 * defect in the gate; a silent gate implying coverage it does not have is the
 * worse of the two, which is why the exclusions are enumerated here rather
 * than left implicit in one path constant.
 *
 * 🔴 SCHEDULING. The reach into the app and into the lens packages is a
 * filesystem path, not a manifest dependency, and neither depends on anything
 * here — so `nx affected` does not schedule this project when a lens changes,
 * whether the lens lives in the app or in a package. The gate runs on every
 * full `bun run test` and post-merge, not on a PR that touches only a lens. A
 * lens package's artifacts are build outputs, gitignored rather than
 * committed: the repository's `prepare` hook compiles them at install, so a
 * fresh checkout has them once `bun install` has run.
 *
 * 🔴 TIERS. Each scan root's lens declares its tier on its lens facet
 * (`routeLensFacet.of({ …, tier })`), and every operation the root declares
 * carries it. A Tier 1 lens compiles against `@canonical/prism-contract`
 * alone; a Tier 2 lens also selects the Prose extension. Tier 2 operations
 * execute here because this provider serves that extension: their running
 * green is the expected result, and their tier says what they ask of a
 * provider, not that they failed to ask less.
 *
 * Test infrastructure: excluded from the build (tsconfig.build.json) and from
 * coverage (vitest.config.ts).
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** This module's own directory, `src/testing/`. */
const HERE = dirname(fileURLToPath(import.meta.url));

/** From src/testing/ the repo root is five levels up. */
const APP_RELATIVE_PATH = "../../../../../apps/react/pragma-docs";

/** From src/testing/ the prism packages' directory is three levels up. */
const PRISM_PACKAGES_RELATIVE_PATH = "../../..";

/** The directory-name prefix that marks a prism package as a lens. */
const LENS_PACKAGE_PREFIX = "lens-";

/** The docsite app this provider is measured against. */
const APP_ROOT: string = resolve(HERE, APP_RELATIVE_PATH);

/** The directory holding every prism package, this one among them. */
const PRISM_PACKAGES_ROOT: string = resolve(HERE, PRISM_PACKAGES_RELATIVE_PATH);

/**
 * One scan root: a directory whose `graphql` tags declare lens operations,
 * the directory where relay-compiler writes those operations' artifacts, and
 * the tier its lens declares.
 */
export interface LensSource {
  /** The tree scanned for `graphql` tags. */
  readonly directory: string;
  /** The relay-compiler output holding each declared operation's text. */
  readonly artifactDirectory: string;
  /**
   * The tier the root's lens facet declares: 1 for a lens that compiles
   * against the contract alone, 2 for one that also selects the Prose
   * extension. `undefined` for a root that declares no lens.
   */
  readonly tier: 1 | 2 | undefined;
}

/** A lens declaration: the object a `routeLensFacet.of({ … })` call is given. */
const LENS_FACET_PATTERN = /routeLensFacet\.of\(\s*\{([^}]*)\}\s*\)/g;

/** A literal tier inside a lens declaration. */
const LITERAL_TIER_PATTERN = /\btier:\s*([12])\b/;

/** A test file, which may declare lenses of its own as fixtures. */
const TEST_FILE_PATTERN = /\.tests?\.tsx?$/;

/**
 * Every scan root, the app's core lenses first: the docsite's
 * `src/domains/lenses` with its committed artifacts, then each lens package
 * (`packages/prism/lens-*`) with the artifacts its `build` script compiles
 * into its own `src/__generated__`. The package list is read off the
 * directory, never written down, so a new lens package is scanned the day it
 * lands.
 *
 * Throws when a lens package has no `src`, since a lens with nothing to scan
 * would otherwise pass as a lens with no operations.
 *
 * @note Impure: reads the filesystem.
 */
export const collectLensSources = (): readonly LensSource[] => {
  const packages = readdirSync(PRISM_PACKAGES_ROOT, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() && entry.name.startsWith(LENS_PACKAGE_PREFIX),
    )
    .map((entry) => join(PRISM_PACKAGES_ROOT, entry.name))
    .sort();
  for (const packageRoot of packages) {
    if (!existsSync(join(packageRoot, "src"))) {
      throw new Error(
        `The lens package at ${packageRoot} has no src directory. A lens ` +
          "package's operations are declared under src; a package that has " +
          "none cannot be measured, and it must not pass as one with no " +
          "operations either.",
      );
    }
  }
  const appLenses = join(APP_ROOT, "src/domains/lenses");
  return [
    {
      directory: appLenses,
      artifactDirectory: join(APP_ROOT, "src/relay/__generated__"),
      tier: readLensTier(appLenses),
    },
    ...packages.map((packageRoot) => ({
      directory: join(packageRoot, "src"),
      artifactDirectory: join(packageRoot, "src/__generated__"),
      tier: readLensTier(join(packageRoot, "src")),
    })),
  ];
};

/**
 * The tier a scan root's lens declares, read off the `routeLensFacet.of({…})`
 * calls in its non-test sources: a literal `tier: 1` or `tier: 2`.
 *
 * Throws when a declaration carries no literal tier, since its operations'
 * tier could not then be read, and when one root declares two tiers, since
 * the root's operations would then carry neither. A root that declares no
 * lens has no tier. A root that does not exist has none either:
 * `discoverLensOperations` refuses a missing app root on its own terms.
 *
 * @note Impure: reads the filesystem.
 */
export const readLensTier = (directory: string): 1 | 2 | undefined => {
  if (!existsSync(directory)) return undefined;
  const tiers = new Set<1 | 2>();
  for (const file of tsxFilesUnder(directory)) {
    if (TEST_FILE_PATTERN.test(file)) continue;
    for (const [, body] of readFileSync(file, "utf8").matchAll(
      LENS_FACET_PATTERN,
    )) {
      const tier = LITERAL_TIER_PATTERN.exec(body ?? "")?.at(1);
      if (tier === undefined) {
        throw new Error(
          `A lens facet in ${file} declares no literal tier. Each operation ` +
            "this gate measures carries its lens's tier, read off the facet " +
            "as `tier: 1` or `tier: 2`.",
        );
      }
      tiers.add(tier === "1" ? 1 : 2);
    }
  }
  if (tiers.size > 1) {
    throw new Error(
      `The lenses under ${directory} declare more than one tier. Every ` +
        "operation under one scan root carries one tier, so a root's lenses " +
        "must agree on it.",
    );
  }
  return [...tiers].at(0);
};

const tsxFilesUnder = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      // A package's own artifacts sit under its scan root; they carry
      // operation text, not tags, and are read through `readOperationText`.
      return entry.name === "__generated__" ? [] : tsxFilesUnder(full);
    }
    // `.ts` as well as `.tsx`: the lens tree already carries *Query.ts
    // modules by convention, and a `graphql` tag in one of them would otherwise
    // be invisible to a gate whose whole claim is that the set is derived
    // from the tree.
    return entry.isFile() && /\.tsx?$/.test(entry.name) ? [full] : [];
  });

/**
 * The query operation names one file declares.
 *
 * Template bodies are captured FIRST and operation names read out of those
 * bodies, never out of the raw file text: these components carry extensive
 * TSDoc prose, and matching `query X(` against it would invent operations
 * that do not exist.
 */
const readDeclaredOperationNames = (file: string): string[] =>
  [...readFileSync(file, "utf8").matchAll(/graphql`([\s\S]*?)`/g)].flatMap(
    ([, body]) => [
      ...[...(body ?? "").matchAll(/\bquery\s+([A-Za-z_]\w*)\s*[({]/g)].map(
        ([, name]) => name as string,
      ),
      ...[
        ...(body ?? "").matchAll(/@refetchable\(\s*queryName:\s*"([^"]+)"/g),
      ].map(([, name]) => name as string),
    ],
  );

/**
 * Every query operation declared under a scan root, each mapped to the
 * source that declares it.
 *
 * Throws — never returns empty, never skips — when the app's lens directory
 * is missing: a gate that goes quiet when its subject disappears is worse
 * than no gate. Throws too when two sources declare the same operation name,
 * since the name alone then cannot say whose artifact to read.
 *
 * @note Impure: reads the filesystem.
 */
export const discoverLensOperations = (): ReadonlyMap<string, LensSource> => {
  const sources = collectLensSources();
  const appLenses = sources.at(0);
  if (appLenses === undefined || !existsSync(appLenses.directory)) {
    throw new Error(
      `Lens directory not found at ${appLenses?.directory ?? APP_ROOT}. This ` +
        "gate measures the docsite's own lens operations against this " +
        "provider; it cannot run without the app, and it must not pass " +
        "without it either.",
    );
  }

  const operations = new Map<string, LensSource>();
  for (const source of sources) {
    for (const file of tsxFilesUnder(source.directory)) {
      for (const name of readDeclaredOperationNames(file)) {
        const declarer = operations.get(name);
        if (declarer !== undefined && declarer !== source) {
          throw new Error(
            `The lens operation "${name}" is declared under both ` +
              `${declarer.directory} and ${source.directory}. Operation ` +
              "names must be unique across the scan roots, or this gate " +
              "cannot tell whose artifact to execute.",
          );
        }
        operations.set(name, source);
      }
    }
  }
  return operations;
};

/**
 * Every query operation declared under a scan root, sorted.
 *
 * @note Impure: reads the filesystem.
 */
export const discoverLensOperationNames = (): string[] =>
  [...discoverLensOperations().keys()].sort();

/**
 * The full operation text of a lens operation's Relay artifact, read from the
 * artifact directory of the source that declares it.
 *
 * Read as TEXT and parsed out of the `params.text` literal rather than
 * imported: the artifact modules open with a value-position import of
 * `relay-runtime`, a package this one does not and should not depend on.
 *
 * A null `text` means the lens switched to persisted queries, and the
 * operation text no longer lives in the repo. That must fail loudly rather
 * than quietly testing nothing.
 *
 * @note Impure: reads the filesystem.
 */
export const readOperationText = (name: string): string => {
  const source = discoverLensOperations().get(name);
  if (source === undefined) {
    throw new Error(
      `No scan root declares the lens operation "${name}". This gate reads ` +
        "only the operations a lens declares.",
    );
  }
  const artifact = join(source.artifactDirectory, `${name}.graphql.ts`);
  if (!existsSync(artifact)) {
    throw new Error(
      `No Relay artifact for the lens operation "${name}" at ${artifact}. ` +
        "Either the operation was renamed without regenerating artifacts, or " +
        "relay-compiler has not been run: `bun run relay` in the app, " +
        "`bun run build` in a lens package.",
    );
  }
  const text = readFileSync(artifact, "utf8");
  const match = /"text":\s*("(?:[^"\\]|\\.)*")/.exec(text);
  const literal = match?.at(1);
  if (literal === undefined) {
    throw new Error(
      `The Relay artifact for "${name}" carries no operation text (${artifact}). ` +
        "This is what persisted queries look like — the text is no longer in " +
        "the repo, so this gate cannot execute it.",
    );
  }
  return JSON.parse(literal) as string;
};
