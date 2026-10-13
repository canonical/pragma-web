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
    onclick: (event: MouseEvent) => void;
    ondismiss?: never;
    dismissLabel?: never;
  };

/** A chip with only its dismissal control in the tab order. */
type DismissibleChipProps = OwnProps &
  Omit<SvelteHTMLElements["span"], keyof OwnProps | "children" | "onclick"> & {
    onclick?: never;
    ondismiss: (event: MouseEvent) => void;
    /** Accessible name for the removal button; defaults to `Dismiss {lead}: {value}`. */
    dismissLabel?: string;
  };

/** Chips always have exactly one action. Use Tag for non-interactive metadata. */
export type ChipProps = ActionChipProps | DismissibleChipProps;
