import type { IconName } from "@canonical/ds-assets";
import type { SvelteHTMLElements } from "svelte/elements";

export interface IconProps extends Omit<SvelteHTMLElements["svg"], "children"> {
  /** The ds-assets icon to render. */
  icon: IconName | (string & {});
  /** Where the icon sprites are served. Defaults to `"/icons"`. */
  rootPath?: string;
}
