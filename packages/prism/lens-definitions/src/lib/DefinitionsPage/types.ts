/**
 * Props accepted by `DefinitionsPage`: the route's content props. The router
 * calls the page with `{ params, search }` and nothing else, so the page
 * takes no native props of its `<section>` root: spreading the rest would
 * write the router's `search` object onto the element.
 */
export interface DefinitionsPageProps {
  /** Additional CSS class names. */
  className?: string;
  /** Route params: `/definitions` passes `{}`, `/definitions/:term` passes
   * `{ term }` with `term` percent-decoded by the router codec. */
  readonly params: { readonly term?: string };
}
