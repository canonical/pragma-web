/**
 * The hermetic corpus's roots, resolved from this file's own location.
 *
 * Every test in this package runs against `src/testing/__fixtures__/corpus` rather than
 * against a populated refs cache, because no CI leg and no fresh clone has one.
 * See that directory's README for what each file makes falsifiable.
 *
 * Test infrastructure: excluded from the build (tsconfig.build.json) and from
 * coverage (vitest.config.ts).
 */

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The fixtures sit beside this file, under `src/testing/`. */
const CORPUS_ROOT: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "./__fixtures__/corpus",
);

/** The corpus's refs cache — the shape `~/.cache/pragma/refs/@canonical` has. */
export const CORPUS_REFS_ROOT: string = join(CORPUS_ROOT, "refs/@canonical");

/** A directory that exists but holds no `.ttl` — the empty-cache case. */
export const CORPUS_EMPTY_REFS_ROOT: string = join(CORPUS_ROOT, "refs");

/** A path guaranteed absent — the missing-cache case. */
export const MISSING_ROOT: string = join(CORPUS_ROOT, "no-such-root");
