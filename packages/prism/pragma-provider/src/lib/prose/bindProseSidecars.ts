import type { QueryFn } from "@canonical/ke-graphql";
import type { ProseSidecar, TtlSource } from "../config/index.js";
import { extractReferences } from "./extractReferences.js";
import { findRefusedIri } from "./findRefusedIri.js";
import { indexProse } from "./indexProse.js";
import { listProseCandidates } from "./listProseCandidates.js";
import { selectSubjects } from "./selectSubjects.js";
import type { ProseBinding, ProseCandidate } from "./types.js";

/**
 * Refuse a bound sidecar that links to a destination the store cannot parse
 * as an IRI.
 *
 * References resolve through ke-graphql's entity loader, which sends every
 * IRI asked for in the same tick in one query, so a single unparseable one
 * would fail every reference and every `node(id:)` loaded beside it. Each
 * distinct reference is probed once, at boot, so the author hears of it here
 * rather than as a null `prose` at query time.
 *
 * @param query - Runs SPARQL against the booted store.
 * @param bound - The candidates the graph describes, one per sidecar.
 * @param prefixes - The prefix map references are expanded against.
 * @throws When a sidecar links to a destination the store refuses, naming
 * the sidecar and the destination.
 * @note Impure: queries the store once per distinct reference.
 */
const assertReferencesParse = async (
  query: QueryFn,
  bound: readonly ProseCandidate[],
  prefixes: Readonly<Record<string, string>>,
): Promise<void> => {
  const linked = bound.flatMap((candidate) =>
    extractReferences(candidate.markdown, prefixes).map((iri) => ({
      iri,
      path: candidate.path,
    })),
  );
  const refused = await findRefusedIri(query, [
    ...new Set(linked.map((link) => link.iri)),
  ]);
  if (refused === undefined) return;
  const paths = linked
    .filter((link) => link.iri === refused.iri)
    .map((link) => link.path);
  throw new Error(
    `prose sidecar ${paths.join(", ")} links to ${refused.iri}, which the store cannot parse as an IRI: fix the link's destination.`,
    { cause: refused.reason },
  );
};

/**
 * Bind the collected sidecars to the entities they describe, against the
 * store, once.
 *
 * Each sidecar's name is read every way it can be, in every namespace its
 * directory's Turtle declares; one query keeps the readings that name a
 * subject in the graph; and the survivors are indexed by entity. See
 * `indexProse` for what throws and what is reported as unbound; a bound
 * sidecar linking to a destination the store cannot parse as an IRI throws
 * too.
 *
 * @param input.sidecars - The collected sidecars.
 * @param input.sources - The collected Turtle sources.
 * @param input.prefixes - The prefix map references are expanded against.
 * @param input.query - Runs SPARQL against the booted store.
 * @returns The prose index, and the sidecars that name no entity.
 * @throws When a bound sidecar links to a destination the store refuses.
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
  const binding = indexProse({ sidecars, candidates, subjects, prefixes });
  await assertReferencesParse(
    query,
    candidates.filter((candidate) => subjects.has(candidate.iri)),
    prefixes,
  );
  return binding;
};
