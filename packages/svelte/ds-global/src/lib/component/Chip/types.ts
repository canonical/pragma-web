import type { ModifierFamily } from "@canonical/ds-types";
import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type OwnProps = {
  /** The attribute or entity represented by the chip. */
  value: string;
  /** Optional key preceding the value. */
  lead?: string;
  /** Decorative leading icon. */
  icon?: Snippet;
  /** Optional badge following the value. */
  badge?: Snippet;

  criticality?: ModifierFamily<"criticality">;
};

/** A chip activated as a whole by pointer or keyboard. */
type ActionChipProps = OwnProps &
  Omit<
    SvelteHTMLElements["button"],
    keyof OwnProps | "children" | "onclick"
  > & {
    onclick: NonNullable<SvelteHTMLElements["button"]["onclick"]>;
    children?: never;
  };

/** A chip with only its dismissal control in the tab order. */
type DismissibleChipProps = OwnProps &
  Omit<SvelteHTMLElements["span"], keyof OwnProps | "children" | "onclick"> & {
    onclick?: never;
    /** The dismissal control, rendered after the value and badge. */
    children: Snippet;
  };

/** Chips always have exactly one action. Use Tag for non-interactive metadata. */
export type ChipProps = ActionChipProps | DismissibleChipProps;

export type ChipContext = {
  readonly defaultDismissLabel: string;
  /** Register a dismissal control and return its cleanup function. */
  registerDismiss: () => () => void;
};
