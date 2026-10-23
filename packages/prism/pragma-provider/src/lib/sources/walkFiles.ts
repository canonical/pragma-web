import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Every file under `dir` whose name ends in `extension`, recursively, as
 * absolute paths in directory-listing order.
 *
 * Dot-prefixed entries are skipped, files and directories alike: editor and
 * channel artifacts such as `.modifier.dark.ttl` are not sources. A `dir`
 * that does not exist yields nothing, which is the state a partially
 * populated refs cache is in.
 *
 * @param dir - The directory to walk.
 * @param extension - The filename suffix to keep, dot included (`".ttl"`).
 * @returns The matching files' paths.
 * @note Impure: reads the filesystem.
 */
export const walkFiles = (dir: string, extension: string): string[] => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".")) return [];
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(full, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [full] : [];
  });
};
