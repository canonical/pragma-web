/**
 * The Journeys domain: the demand model, its jobs and the surfaces that
 * serve them, read as a table or as a graph of one coordinate's journeys.
 *
 * It is an add-on to the docsite, not one of the core lenses, and it
 * cannot become one. `JourneysExplorerQuery` joins four root fields the
 * pragma ontology derives (`jobs`, `pairings`, `personas` and `job`) and
 * walks eleven of its properties. The contract exposes an entity's class
 * and that class's schema, whose `field(name:)` answers with cardinality
 * metadata rather than a value, and no contract field returns the value of
 * an arbitrary property on an arbitrary entity. Instance-level traversal of
 * relations is all this domain does, so no rewrite of its operation makes
 * it neutral: only a contract that grew generic reflection could.
 *
 * The owners keep it beside the core lenses as a plugin to be: once the
 * docsite has a plugin mechanism, it registers its own routes, rail entry
 * and strip claims from outside the app's route table, rather than being
 * wired into `src/routes.tsx` by hand as it is today. The lens gate in
 * `packages/prism/graph-example/src/testing/integration/lensOperations.test.ts`
 * scans the core lenses and forbids moving an operation meant to be core
 * out of them.
 *
 * @module
 */

export * from "./JourneyWell/index.js";
export {
  JOB_PAGE_SIZE,
  journeysExplorerQueryNode,
  journeysExplorerVariables,
  PAIRING_PAGE_SIZE,
  readJobParam,
} from "./journeysQuery.js";
export { default as journeysLayout } from "./layout.js";
export * from "./lib/index.js";
export { default as journeysRoutes } from "./routes.js";
