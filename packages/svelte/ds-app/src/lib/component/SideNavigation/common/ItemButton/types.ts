import type { IconName } from "@canonical/ds-assets";
import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type OwnProps = {
  /** Content: the label text, or a snippet rendering it. */
  children?: string | Snippet;
  /** Leading icon (start slot), by ds-assets icon name. */
  icon?: IconName;
  /** Trailing content (end slot): a badge, count, etc. */
  slot?: Snippet;
};

/**
 * `type` is excluded in addition to `OwnProps`: this is always a plain
 * action trigger, never a form submit/reset control. The native attributes
 * go to the `<button>`; `class` goes to the row's `<li>`.
 */
export type ItemButtonProps = OwnProps &
  Omit<SvelteHTMLElements["button"], keyof OwnProps | "type">;
