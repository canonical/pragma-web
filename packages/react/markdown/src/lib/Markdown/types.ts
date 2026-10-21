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
   * off only for trusted documents whose generated attributes (`class`,
   * `style`) must survive. Turning it off keeps no link in another scheme:
   * name the scheme in `linkSchemes` for that.
   */
  readonly sanitize?: boolean;
  /**
   * The URL schemes, beyond `http`, `https`, `irc`, `ircs`, `mailto` and
   * `xmpp`, in which a link keeps its `href`, sanitised or not. Each is
   * named in lower case without its colon (`ds`, not `ds:`); `javascript`,
   * `vbscript`, `data` and `file` are refused. An `href` in any other scheme
   * is dropped, and an image's `src` keeps only the default schemes.
   * Defaults to none.
   */
  readonly linkSchemes?: readonly string[];
};
