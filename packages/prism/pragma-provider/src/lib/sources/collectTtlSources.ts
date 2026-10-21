/**
 * Walking pragma's two source roots into one ordered, escaped, filtered list.
 *
 * The graph compiles from TWO roots into ONE store:
 *
 *   1. the ref packages (design-system, code-standards, anatomy-dsl), each
 *      resolved to a directory by `resolveRefRoots` — the installed npm
 *      package by default, or an entry in the pragma CLI's refs cache — with
 *      every `.ttl` under its `definitions/` and `data/`;
 *   2. the semantics working tree — the `surface` ontology and the
 *      `design-system-docs` graph that instantiates it: the docsite's own
 *      demand model (jobs, coordinates, pairings, surfaces, layouts), which
 *      the journeys add-on reads.
 *
 * Both roots skip dot-prefixed entries (editor and channel artifacts such as
 * `.modifier.dark.ttl` are not graph sources, and a dot-prefixed Turtle local
 * name is not even valid RDF).
 *
 * WHY THIS TAKES ROOTS RATHER THAN READING THE ENVIRONMENT. In the app this
 * function resolved `$PRAGMA_REFS_DIR` itself, which made it untestable: the
 * only way to exercise it was to have a populated refs cache. Roots are now
 * an argument, resolution lives in `resolveRefRoots.ts` and `resolveSemRoot`
 * and is separately testable, and the package's whole test suite runs against
 * a checked-in corpus (`src/testing/__fixtures__/corpus`) that needs neither
 * cache nor semantics tree.
 *
 * WHY THE SEMANTICS ROOT CAN BE `null`. The second root is optional by
 * nature (it is a working tree, not a package), and the collector announces
 * a missing one so a developer learns their checkout is incomplete. The
 * schema the docsite commits must not depend on what a machine has checked
 * out, so its generator asks for the ref packages alone — `null` says so
 * explicitly, and is not a miss to announce.
 */

import { existsSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  CHANNEL_DOTTED_REF,
  DEFAULT_SEM_ROOT,
  EXCLUDED_SOURCES,
  SEM_PACKAGES,
  type SourceRoots,
  TTL_DIRS,
  type TtlSource,
} from "../config/index.js";
import { mapTurtleSyntax } from "./turtleText.js";
import { walkFiles } from "./walkFiles.js";

/**
 * Escape channel-dotted local names so strict Turtle parsers accept them.
 *
 * Only in the document's SYNTAX. The same spelling inside an `rdfs:comment`
 * or an `<IRIREF>` is data, and inserting a backslash there would turn a
 * source that parses into one that does not — `\\.` is not a valid Turtle
 * string escape, and a backslash is not valid in an IRI reference at all.
 */
export const escapeChannelDottedRefs = (content: string): string =>
  mapTurtleSyntax(content, (syntax) =>
    syntax.replace(CHANNEL_DOTTED_REF, "$1:\\."),
  );

/** The semantics root: `$PRAGMA_SEM_DIR` or the sibling working tree. */
export const resolveSemRoot = (): string =>
  process.env.PRAGMA_SEM_DIR ?? DEFAULT_SEM_ROOT;

/**
 * Sort key: the store-visible path. Paths are unique (each root's label is
 * its package name and the ref and semantics package lists are disjoint), so
 * there is no equal arm.
 */
const byPath = (a: TtlSource, b: TtlSource): number =>
  a.path < b.path ? -1 : 1;

/** `<label>/<path relative to base>`, forward slashes on every platform. */
const storeVisiblePath = (label: string, base: string, full: string): string =>
  `${label}/${relative(base, full).split(sep).join("/")}`;

/**
 * Collect every `.ttl` under `dir` (recursively, skipping dot-prefixed
 * entries) into `out`, keyed relative to `base` under `label`.
 */
export const walkTtl = (
  dir: string,
  base: string,
  label: string,
  out: TtlSource[],
): void => {
  for (const full of walkFiles(dir, ".ttl")) {
    out.push({
      path: storeVisiblePath(label, base, full),
      content: escapeChannelDottedRefs(readFileSync(full, "utf-8")),
    });
  }
};

/**
 * Walk both roots into one sorted list, with `EXCLUDED_SOURCES` dropped.
 *
 * Throws when the ref roots yield nothing at all — a graph with no sources
 * is a broken install or an empty cache, never a schema to serve. A
 * semantics root that is missing is announced and skipped; one that is
 * present but contributes nothing for a package is announced per package;
 * `null` is skipped silently, because the caller asked for that.
 */
export const collectTtlSources = ({
  refRoots,
  semRoot,
}: SourceRoots): TtlSource[] => {
  const sources: TtlSource[] = [];
  for (const root of refRoots) {
    for (const sub of TTL_DIRS) {
      walkTtl(join(root.dir, sub), root.dir, root.package, sources);
    }
  }
  if (sources.length === 0) {
    throw new Error(
      `no .ttl sources found under ${refRoots.map((root) => root.dir).join(", ")} — run \`bun install\` (or \`pragma sources update\` for a refs cache).`,
    );
  }
  if (semRoot === null) {
    // Asked for explicitly: the ref packages alone, whatever the machine has.
  } else if (existsSync(semRoot)) {
    for (const pkg of SEM_PACKAGES) {
      const root = join(semRoot, pkg);
      const before = sources.length;
      for (const sub of TTL_DIRS) {
        walkTtl(join(root, sub), root, pkg, sources);
      }
      if (sources.length === before) {
        console.warn(
          `[graphql] semantics package "${pkg}" contributed no .ttl sources from ${root} — the part of the demand model it carries will be absent from the schema. Check that PRAGMA_SEM_DIR names a complete semantics tree.`,
        );
      }
    }
  } else {
    console.warn(
      `[graphql] semantics tree not found at ${semRoot} — compiling the first source root only. The demand model (${SEM_PACKAGES.join(", ")}) will be absent from the schema. Set PRAGMA_SEM_DIR to point at it.`,
    );
  }
  const collected = sources.filter(
    (source) => !EXCLUDED_SOURCES.includes(source.path),
  );
  collected.sort(byPath);
  return collected;
};
