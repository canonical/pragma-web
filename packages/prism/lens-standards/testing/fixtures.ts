/**
 * The static data the lens's tests share: the `cs:` addresses the captured
 * stores under `records/` serve, the binding a site would pass, the homes it
 * would declare, and the timeout of the full-stack suites.
 */

import type { Homes } from "@canonical/prism-core";
import type { StandardsBinding } from "../src/lib/types.js";

/** The `cs:` namespace, spelled once. */
export const CS_NAMESPACE = "http://pragma.canonical.com/codestandards#";

/**
 * The reading exemplar `records/standardEntityRecords` serves, as an absolute
 * IRI: `node(id:)` accepts nothing else, so the route param carries it
 * percent-encoded.
 */
export const LINK_COMPONENT_URI = `${CS_NAMESPACE}react.component.link_component`;

/** Its compact form, which the reader sees in the article. */
export const LINK_COMPONENT_CURIE = "cs:react.component.link_component";

/** The class the lens is bound to, as the graph spells it back. */
export const CODE_STANDARD_CLASS_URI = `${CS_NAMESPACE}CodeStandard`;

/** The binding a pragma site passes: the class in its prefixed form. */
export const STANDARDS_BINDING_FIXTURE: StandardsBinding = {
  classUri: "cs:CodeStandard",
};

/**
 * The per-test timeout of the suites that mount the full provider stack and
 * the static router: under heavy parallel load they can overrun vitest's 5s
 * default. Per test only; the config default stands.
 */
export const STANDARDS_TEST_TIMEOUT_MS = 15_000;

/**
 * The homes a site mounting the lens would declare for the one type the lens
 * owns a page for: a code standard lives on its reading page, addressed by
 * its absolute IRI. Every other type has no home here, so its mentions read
 * as text.
 */
export const HOMES: Homes = {
  CodeStandard: (node, router) =>
    router.buildPath("standardEntity", { params: { uri: node.uri } }),
};
