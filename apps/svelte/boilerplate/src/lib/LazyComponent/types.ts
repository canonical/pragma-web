import type { Snippet } from "svelte";
import type { MessageKey } from "../../i18n/index.js";

/** Props for `LazyComponent`. */
export interface LazyComponentProps {
  /**
   * The pending fetch: it resolves to the catalog key of the text to show.
   * A page's `load` returns it without awaiting it, so SvelteKit streams it.
   */
  data: Promise<MessageKey>;
  /** Rendered while `data` is pending. */
  pending?: Snippet;
}
