import type { SvelteHTMLElements } from "svelte/elements";

/** Native button props for the chip's dismissal control. */
export type ChipDismissProps = Omit<
  SvelteHTMLElements["button"],
  "onclick" | "type" | "aria-label"
> & {
  onclick: NonNullable<SvelteHTMLElements["button"]["onclick"]>;
  /**
   * Button behavior within a form.
   * @default "button"
   */
  type?: SvelteHTMLElements["button"]["type"];
  /**
   * Accessible name for the removal button.
   * Without a lead, the contextual name is `Dismiss {value}`.
   * @default `Dismiss {lead}: {value}`
   */
  "aria-label"?: SvelteHTMLElements["button"]["aria-label"];
};
