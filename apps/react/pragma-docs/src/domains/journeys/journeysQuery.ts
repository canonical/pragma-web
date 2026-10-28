/**
 * The Journeys lens's query contract (the `definitionsQuery.ts` sibling):
 * the compiled `JourneysExplorerQuery` operation plus the one variables
 * builder, shared by the route's `warmJourneys` and the page's hook —
 * byte-identical variables everywhere. Artifact-only imports: this module
 * rides the server bricks' native import chain; the tag lives in
 * `JourneysExplorer.tsx`.
 *
 * ONE operation serves BOTH routes (`/journeys` and `/journeys/:job`): the
 * job-less index runs the same operation, and the selected job is read
 * from the URL rather than fetched separately — the whole demand model is
 * small enough (17 jobs and 30 pairings in the docs site's model) that one
 * operation carries it and selection is pure presentation over data already
 * in the store.
 *
 * THE JOB IS THE ADDRESSABLE THING (P-D7). A journey is a job's path
 * through the surfaces that serve it, so the job — not the coordinate,
 * not the pairing — is what a reader links to, cites and returns to. The
 * coordinate roots the DIAGRAM (ruling R1); the job addresses the VIEW.
 */

import type { JourneysExplorerQuery$variables } from "#relay/__generated__/JourneysExplorerQuery.graphql.js";
import journeysExplorerQueryNode from "#relay/__generated__/JourneysExplorerQuery.graphql.js";

/** The compiled operation (full text under `params.text`, `id: null`). */
export { journeysExplorerQueryNode };

/**
 * Read the optional `:job` param off a route match. `undefined` on
 * `/journeys` (the index — the diagram with an empty inspector); asserts
 * the shape at the one boundary where params are `unknown`-typed records.
 */
export const readJobParam = (
  params: Readonly<Record<string, unknown>>,
): string | undefined => {
  const job = params.job;
  if (job === undefined) return undefined;
  if (typeof job !== "string" || job.length === 0) {
    throw new Error(
      "journeys :job param must be a non-empty string when present",
    );
  }
  return job;
};

/**
 * The page ceiling the schema enforces. `first:` caps at 100 — asking for
 * 200 silently returns 100 — and a demand model may hold more pairings
 * than that: the docs site's holds 30, and an earlier model of 52 jobs held
 * 133 (the record captures in `__fixtures__/` are of that model).
 *
 * THE COVERAGE PROBLEM, and why this is not paginated. Over 133 pairings a
 * single `first:100` page reached only 38 of the 51 jobs that had
 * pairings: 13 jobs would vanish from the lens with nothing on screen
 * saying so. That is precisely the silent-truncation failure this lens
 * exists to expose, so it cannot be the lens's own bug.
 *
 * THE SOLUTION is a `first:100` + `last:100` UNION in one operation rather
 * than a cursor walk. Over those 133 pairings the two windows overlapped
 * by 67 and together covered every pairing and every paired job; over the
 * docs site's 30 each window holds all of them. The union is taken by URI,
 * so the overlap collapses to nothing. This beats the cursor approach on
 * every axis that matters here:
 * no `endCursor` has to be threaded through the route's `warm` as a
 * variable, no second round trip exists to fail
 * independently, and the operation stays one operation — the P-2 register
 * holds.
 *
 * It is honest only while the model fits in two windows.
 * `collectJourneys` is handed both windows and merges them; the union's
 * completeness is asserted in the e2e block against the live graph, so the
 * day the model outgrows two windows the lens says so rather than quietly
 * dropping journeys.
 */
export const PAIRING_PAGE_SIZE = 100;

/**
 * The jobs page size. The `jobs` root connection defaults to FIFTY, not to
 * everything: over the earlier 52-job model the default page returned 50
 * jobs with `hasNextPage: true`, and `first: 100` returned all 52. The docs
 * site's 17 jobs fit the default page, but a model past fifty jobs would
 * not, so asking explicitly is load-bearing, not decoration: without it the
 * jobs beyond the fiftieth (and their journeys) would be missing from the
 * diagram for no visible reason.
 */
export const JOB_PAGE_SIZE = 100;

export const journeysExplorerVariables = (
  job: string | undefined,
): JourneysExplorerQuery$variables => ({
  jobs: JOB_PAGE_SIZE,
  pairings: PAIRING_PAGE_SIZE,
  hasJob: job !== undefined,
  uri: job ?? "",
});
