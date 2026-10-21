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
