import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type OwnProps = {
  /** Group header text, rendered via GroupHeader. Omitted when absent. */
  label?: string;
  /**
   * Whether the group starts with a divider. The anatomy draws one before
   * every group except the first; the parent laying the groups out decides.
   */
  divider?: boolean;
  /** The group's navigation entries (Item / ItemExpandable rows). */
  children?: Snippet;
};

export type GroupProps = OwnProps &
  Omit<SvelteHTMLElements["section"], keyof OwnProps>;
