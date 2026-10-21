/**
 * The exemplar nodes the docsite's tests address, one per lens.
 *
 * Route pins, warm tests and the prepare step's HTTP contract all speak
 * about the same nodes; keeping each identifier in one place means a test
 * that changes an exemplar changes it for every test that pins it.
 */

/** The components exemplar: the button component's CURIE. */
export const COMPONENT_URI = "ds:global.component.button";

/** The definitions exemplar: the UIBlock class's term (a CURIE). */
export const UIBLOCK_TERM = "ds:UIBlock";

/**
 * The standards exemplar, as an absolute IRI: `node(id:)` accepts nothing
 * else, so the reading route's param is never the compact form.
 */
export const STANDARD_URI =
  "http://pragma.canonical.com/codestandards#code.array.safe_access";

/** The journeys exemplar: a job's IRI. */
export const JOB_URI = "sem://design-system-docs#job.l3";

/**
 * A graph answer to the playground's `ComponentProbeQuery`: the components
 * exemplar, named "Button".
 */
export const COMPONENT_PROBE_RESPONSE = {
  data: {
    component: {
      id: COMPONENT_URI,
      uri: COMPONENT_URI,
      name: "Button",
    },
  },
} as const;

/**
 * A class URI in prefixed form, `prefix:Local`: a declared prefix and a
 * local name, never a scheme followed by `//`. The graph-class constants
 * must match it, because `ontologyClass(uri:)` echoes back the absolute IRI
 * and an absolute constant would silently defeat every `toPrefixedUri`
 * comparison written against it.
 */
export const PREFIXED_CURIE_PATTERN = /^[A-Za-z][\w.-]*:[^/][^\s]*$/;
