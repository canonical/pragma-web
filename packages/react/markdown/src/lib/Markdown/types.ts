import type { MarkdownComponents } from "../types.js";

/**
 * Props accepted by `Markdown`.
 *
 * `Markdown` renders the document's elements as a fragment, with no root
 * element of its own, so it is exempt from the convention that a component's
 * props extend its root element's native props.
 *
 * There is deliberately no prop for extra unified plugins: every plugin
 * `Markdown` runs is synchronous, which is what lets it render in a single
 * pass on the server. An asynchronous plugin cannot be passed by mistake.
 */
export type MarkdownProps = {
  /** The Markdown document to render. */
  readonly source: string;
  /**
   * Which component renders each HTML element, keyed by tag name. Replaces
   * `defaultComponents` rather than merging with it; spread
   * `defaultComponents` into the map to keep them. Defaults to
   * `defaultComponents`.
   */
  readonly components?: MarkdownComponents;
  /**
   * Whether to sanitise the rendered HTML against a GitHub-like allow-list.
   * Defaults to `true`.
   *
   * Raw HTML in the source never becomes live markup either way: sanitised,
   * it is removed; unsanitised, it is shown as literal text. Turn sanitising
   * off only for trusted documents whose other attributes (`class`, `style`
   * on generated elements, unknown protocols in links) must survive.
   */
  readonly sanitize?: boolean;
};
