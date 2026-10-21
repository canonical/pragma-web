import { posix } from "node:path";
import type { ProseSidecar, TtlSource } from "../config/index.js";
import { harvestPrefixes } from "../sources/index.js";
import { readSidecarName } from "./readSidecarName.js";
import type { ProseCandidate } from "./types.js";

/**
 * Every entity each sidecar could describe: each reading of its name, in
 * each namespace the Turtle in its directory declares.
 *
 * A sidecar sits beside the Turtle that declares its entity, so the prefixes
 * declared in that directory are the namespaces its name can be in. A
 * sidecar in a directory with no Turtle has no candidate. Nothing here asks
 * the graph which candidates exist. Each directory's Turtle is harvested
 * once, however many sidecars sit in it.
 *
 * @param sidecars - The collected sidecars.
 * @param sources - The collected Turtle sources.
 * @returns The candidates, sidecar by sidecar.
 */
export const listProseCandidates = (
  sidecars: readonly ProseSidecar[],
  sources: readonly TtlSource[],
): ProseCandidate[] => {
  const namespacesByDirectory = new Map<string, ReadonlySet<string>>();
  const readNamespaces = (directory: string): ReadonlySet<string> => {
    const harvested = namespacesByDirectory.get(directory);
    if (harvested) return harvested;
    const namespaces = new Set(
      Object.values(
        harvestPrefixes(
          sources.filter((source) => posix.dirname(source.path) === directory),
        ),
      ),
    );
    namespacesByDirectory.set(directory, namespaces);
    return namespaces;
  };
  return sidecars.flatMap((sidecar) => {
    const namespaces = readNamespaces(posix.dirname(sidecar.path));
    return readSidecarName(posix.basename(sidecar.path)).flatMap((reading) =>
      [...namespaces].map((namespace) => ({
        iri: `${namespace}${reading.localName}`,
        lang: reading.lang,
        path: sidecar.path,
        markdown: sidecar.content,
      })),
    );
  });
};
