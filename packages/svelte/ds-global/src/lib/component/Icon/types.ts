import type { IconName } from "@canonical/ds-assets";
import type { SvelteHTMLElements } from "svelte/elements";

type BaseProps = Omit<SvelteHTMLElements["svg"], "children">;

/** Props for the Icon component, extending the native props of its `<svg>` root. */
export interface IconProps extends BaseProps {
  /**
   * Name of the icon to display.
   * Icons are decorative by default (`aria-hidden="true"`). Pass an
   * `aria-label` (or `aria-labelledby`) when the icon conveys meaning on
   * its own; it is then exposed as a named `img` element.
   */
  icon: IconName;
  /** Root path to the icons (default: /icons). Must be exposed to the user. */
  rootPath?: string;
}
