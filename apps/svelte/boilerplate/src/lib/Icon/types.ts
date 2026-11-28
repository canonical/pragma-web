import type { SvelteHTMLElements } from "svelte/elements";

/**
 * Props for `Icon`: the glyph's name in `@canonical/ds-assets`, plus the native
 * props of the root `<svg>`.
 */
export interface IconProps extends Omit<SvelteHTMLElements["svg"], "children"> {
  /** The icon's name, served at `/icons/<name>.svg`. */
  name: string;
}
