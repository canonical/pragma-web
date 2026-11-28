import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";
import type { CollapseToggleMessages } from "../CollapseToggle/types.js";

type OwnProps = {
  /** Brand content (logo mark) rendered at the start of the header. */
  brand?: Snippet;
  /** Optional application name shown beside the brand. Omitted when absent. */
  applicationName?: string | Snippet;
  /** Whether the navigation is currently expanded. Passed to the collapse toggle. */
  expanded?: boolean;
  /** Called when the collapse toggle is activated. When omitted, the toggle is not rendered. */
  ontoggle?: () => void;
  /** id of the region the collapse toggle controls (`aria-controls`). */
  collapseControls?: string;
  /** The collapse toggle's text. Any message left out keeps its default. */
  collapseToggleMessages?: Partial<CollapseToggleMessages>;
};

export type HeaderProps = OwnProps &
  Omit<SvelteHTMLElements["header"], keyof OwnProps | "children">;
