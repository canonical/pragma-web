import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * List the component folders under the given directories: each directory's
 * PascalCase subfolders, every one of which must carry an anatomy. A
 * directory that does not exist lists none, so a package can name where its
 * components will live before it has any.
 *
 * @param directories - The folders that hold component folders, such as a
 *   package's `src/lib/ui`.
 * @returns The component folders' paths, sorted.
 * @note Impure: reads the file system.
 */
export default function listAnatomyFolders(
  directories: readonly string[],
): string[] {
  return directories
    .filter((directory) => existsSync(directory))
    .flatMap((directory) =>
      readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && /^[A-Z]/.test(entry.name))
        .map((entry) => join(directory, entry.name)),
    )
    .sort();
}
