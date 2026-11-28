import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

/** A single entry in the context switcher's list — user-generated. */
export interface ContextSwitcherItem {
  /** Stable identity for the context (list key and selection matching). */
  key: string;
  /** Display name — also shown in the dropdown field when current. */
  name: string;
  /**
   * Optional route for the context. A `role="menu"` has no place for a link
   * (every row is a `<div role="menuitem">`), so the url rides through
   * `oncontextchange` and the consumer routes. Omitted, the context stays a
   * pure action.
   */
  url?: string;
  /** Supporting text shown under the name in the list. Required by the anatomy. */
  description: string;
  /** Optional badge for dynamic/actionable information. */
  badge?: Snippet;
}

type OwnProps = {
  /** A caption rendered above the dropdown field (e.g. "Project"). Omitted renders none. */
  title?: string | Snippet;
  /** The currently selected context, shown in the dropdown field. */
  currentContext: ContextSwitcherItem;
  /** The user-generated list of available contexts. */
  contexts: ContextSwitcherItem[];
  /** Called when the user selects a context from the list. */
  oncontextchange?: (context: ContextSwitcherItem) => void;
  /** Called when the "create context" action is activated. Omit to hide it. */
  oncreatecontext?: () => void;
  /** Label for the "create context" action. Defaults to `"Create context"`. */
  createContextLabel?: string | Snippet;
  /** Whether the context list is open. Bindable. */
  open?: boolean;
  /** Called when the context list opens or closes. */
  onopenchange?: (open: boolean) => void;
  /** CSS `max-width` of the context list. Defaults to the rail's inner width. */
  maxWidth?: string;
};

/**
 * A "select"-like widget, not a bare disclosure: a `<button>` trigger with
 * `aria-haspopup="menu"`/`aria-expanded`, and a `role="menu"` list. Extends
 * `<div>` — the component's own wrapper, which carries the caption (`title`)
 * and the dropdown field.
 */
export type ContextSwitcherProps = OwnProps &
  Omit<SvelteHTMLElements["div"], keyof OwnProps | "children">;
