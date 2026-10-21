import type { QueryFn } from "@canonical/ke-graphql";
import type { ProseSidecar, TtlSource } from "../config/index.js";
import { indexProse } from "./indexProse.js";
import { listProseCandidates } from "./listProseCandidates.js";
import { selectSubjects } from "./selectSubjects.js";
import type { ProseBinding } from "./types.js";

/**
 * Bind the collected sidecars to the entities they describe, against the
 * store, once.
 *
 * Each sidecar's name is read every way it can be, in every namespace its
 * directory's Turtle declares; one query keeps the readings that name a
 * subject in the graph; and the survivors are indexed by entity. See
 * `indexProse` for what throws and what is reported as unbound.
 *
 * @param input.sidecars - The collected sidecars.
 * @param input.sources - The collected Turtle sources.
 * @param input.prefixes - The prefix map references are expanded against.
 * @param input.query - Runs SPARQL against the booted store.
 * @returns The prose index, and the sidecars that name no entity.
 * @note Impure: queries the store.
 */
export const bindProseSidecars = async ({
  sidecars,
  sources,
  prefixes,
  query,
}: {
  readonly sidecars: readonly ProseSidecar[];
  readonly sources: readonly TtlSource[];
  readonly prefixes: Readonly<Record<string, string>>;
  readonly query: QueryFn;
}): Promise<ProseBinding> => {
  const candidates = listProseCandidates(sidecars, sources);
  const subjects = await selectSubjects(
    query,
    candidates.map((candidate) => candidate.iri),
  );
  return indexProse({ sidecars, candidates, subjects, prefixes });
};
