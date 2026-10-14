import type { SvelteHTMLElements } from "svelte/elements";

/** Native button props for the chip's dismissal control. */
export type ChipDismissProps = Omit<SvelteHTMLElements["button"], "onclick"> & {
  onclick: NonNullable<SvelteHTMLElements["button"]["onclick"]>;
};
