import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import listExports from "./listExports.js";
import readDeclarationDoc from "./readDeclarationDoc.js";
import readFileRole from "./readFileRole.js";

/** Every source file's text under one folder, depth first. */
function readSources(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      return readSources(path);
    }
    return readFileRole(entry.name) === "source" ||
      readFileRole(entry.name) === "barrel"
      ? [readFileSync(path, "utf8")]
      : [];
  });
}

/**
 * List the names a barrel exports by name whose declaration under `folder` carries
 * no `@experimental` tag, or that no file there declares, sorted.
 *
 * @note Impure by design: it reads the file system under `folder`.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function listUnmarkedNames(
  barrel: string,
  folder: string,
): readonly string[] {
  const sources = readSources(folder);
  const names = listExports(readFileSync(barrel, "utf8")).flatMap((record) =>
    record.name === null || record.name === "*" ? [] : [record.name],
  );
  return [...new Set(names)]
    .filter((name) => {
      const docs = sources.flatMap((source) => {
        const doc = readDeclarationDoc(source, name);
        return doc === null ? [] : [doc];
      });
      return (
        docs.length === 0 || docs.some((doc) => !doc.includes("@experimental"))
      );
    })
    .sort();
}
