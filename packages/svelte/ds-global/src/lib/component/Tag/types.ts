import type { ModifierFamily } from "@canonical/ds-types";
import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

/** Non-interactive metadata or status. Use Chip for actionable content. */
export type TagProps = Omit<SvelteHTMLElements["span"], "children"> & {
  /** The metadata or status represented by the tag. */
  value: string;
  /** Optional key preceding the value. */
  lead?: string;
  /** Decorative leading icon. */
  icon?: Snippet;
  /** Optional badge following the value. */
  badge?: Snippet;

  anticipation?: ModifierFamily<"anticipation">;
  importance?: ModifierFamily<"importance">;
  criticality?: ModifierFamily<"criticality">;
};
