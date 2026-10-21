/**
 * The static data the lens's tests share: the exemplar terms each captured
 * store under `records/` serves, the homes a site mounting the lens would
 * declare, and the timeout of the full-stack suites.
 */

import type { Homes } from "@canonical/prism-core";

/** The class exemplar `records/definitionsExplorerRecords` serves. */
export const UIBLOCK_TERM = "ds:UIBlock";

/** The instance-bearing class exemplar
 * `records/definitionsExplorerRecordsComponent` serves. */
export const COMPONENT_TERM = "ds:Component";

/** The property exemplar `records/definitionsExplorerRecordsProperty`
 * serves. */
export const PROPERTY_TERM = "ds:hasSubcomponent";

/**
 * The per-test timeout of the suites that mount the full provider stack and
 * the static router: under heavy parallel load they can overrun vitest's 5s
 * default. Per test only; the config default stands.
 */
export const DEFINITIONS_TEST_TIMEOUT_MS = 20_000;

/**
 * The homes a site mounting the lens would declare for the one type the lens
 * owns a page for: an ontology class lives on its term view, addressed by
 * the compact address the mention resolves it with. Every other type has no
 * home here, so its mentions read as text.
 */
export const HOMES: Homes = {
  OntologyClass: (node, router) =>
    router.buildPath("definitionsTerm", { params: { term: node.uri } }),
};
