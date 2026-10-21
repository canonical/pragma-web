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
 * the graph which candidates exist.
 *
 * @param sidecars - The collected sidecars.
 * @param sources - The collected Turtle sources.
 * @returns The candidates, sidecar by sidecar.
 */
export const listProseCandidates = (
  sidecars: readonly ProseSidecar[],
  sources: readonly TtlSource[],
): ProseCandidate[] =>
  sidecars.flatMap((sidecar) => {
    const directory = posix.dirname(sidecar.path);
    const namespaces = new Set(
      Object.values(
        harvestPrefixes(
          sources.filter((source) => posix.dirname(source.path) === directory),
        ),
      ),
    );
    return readSidecarName(posix.basename(sidecar.path)).flatMap((reading) =>
      [...namespaces].map((namespace) => ({
        iri: `${namespace}${reading.localName}`,
        lang: reading.lang,
        path: sidecar.path,
        markdown: sidecar.content,
      })),
    );
  });
