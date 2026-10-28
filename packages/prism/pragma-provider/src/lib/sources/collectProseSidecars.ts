import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PROSE_EXTENSION,
  type ProseSidecar,
  type RefRoot,
  TTL_DIRS,
} from "../config/index.js";
import { compareByPath, formatStoreVisiblePath } from "./storePaths.js";
import { walkFiles } from "./walkFiles.js";

/**
 * Every Markdown sidecar under the ref packages' `definitions/` and `data/`,
 * sorted by store-visible path.
 *
 * Every ref package is walked, the demand model's shims included: a sidecar
 * describes an entity of the package it ships in, whichever package that
 * is. Which entity a sidecar describes is decided later, against the store;
 * this only finds the files.
 *
 * @param refRoots - The ref packages, each resolved to a directory.
 * @returns The sidecars, with their Markdown text.
 * @note Impure: reads the filesystem.
 */
export const collectProseSidecars = (
  refRoots: readonly RefRoot[],
): ProseSidecar[] =>
  refRoots
    .flatMap((root) =>
      TTL_DIRS.flatMap((sub) =>
        walkFiles(join(root.dir, sub), PROSE_EXTENSION).map((full) => ({
          path: formatStoreVisiblePath(root.package, root.dir, full),
          content: readFileSync(full, "utf-8"),
        })),
      ),
    )
    .sort(compareByPath);
