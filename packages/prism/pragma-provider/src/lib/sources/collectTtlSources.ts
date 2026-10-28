/**
 * Walking pragma's ref packages into one ordered, escaped list.
 *
 * The graph compiles from ONE list of roots into ONE store: the ref packages
 * (`REF_PACKAGES`), each resolved to a directory by `resolveRefRoots` — the
 * installed npm package by default, or an entry in the pragma CLI's refs
 * cache — with every `.ttl` under its `definitions/` and `data/`. The
 * docsite's demand model is no exception: `surface` and
 * `design-system-docs` are ref packages like the rest, installed from the
 * shims in this repository, so there is no second root and no code path for
 * a missing one.
 *
 * Dot-prefixed entries are skipped (editor and channel artifacts such as
 * `.modifier.dark.ttl` are not graph sources, and a dot-prefixed Turtle local
 * name is not even valid RDF).
 *
 * WHY THIS TAKES ROOTS RATHER THAN READING THE ENVIRONMENT. Resolution lives
 * in `resolveRefRoots.ts` and is separately testable, so this function is a
 * plain walk over whatever it is handed, and the package's whole test suite
 * runs it against a checked-in corpus (`src/testing/__fixtures__/corpus`)
 * that needs no refs cache.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CHANNEL_DOTTED_REF,
  type RefRoot,
  TTL_DIRS,
  type TtlSource,
} from "../config/index.js";
import { compareByPath, formatStoreVisiblePath } from "./storePaths.js";
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
      path: formatStoreVisiblePath(label, base, full),
      content: escapeChannelDottedRefs(readFileSync(full, "utf-8")),
    });
  }
};

/**
 * Walk the ref packages into one list, sorted by store-visible path.
 *
 * Throws when the roots yield nothing at all — a graph with no sources is a
 * broken install or an empty cache, never a schema to serve.
 *
 * @param refRoots - The ref packages, each resolved to a directory.
 * @returns Every Turtle source, escaped, in path order.
 * @note Impure: reads the filesystem.
 */
export const collectTtlSources = (
  refRoots: readonly RefRoot[],
): TtlSource[] => {
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
  sources.sort(compareByPath);
  return sources;
};
