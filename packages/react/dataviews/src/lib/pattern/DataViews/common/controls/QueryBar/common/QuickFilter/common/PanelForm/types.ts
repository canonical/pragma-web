import type { ReactNode } from "react";
import type { PlacedConjunct } from "../../../../types.js";

/**
 * The props of a quick filter's panel form. Exempt from the native-prop
 * extension: a private part of the quick filter, whose root takes only
 * what the quick filter hands it.
 */
export type PanelFormProps = {
  /**
   * The conjuncts at the addresses the panel's controls stand for, each
   * with its place: the first at an address the form submits through its
   * control, and a further one rides hidden at its own place. Every other
   * clause rides in the form's hidden fields.
   */
  readonly claimed: readonly PlacedConjunct[];
  /** Whether the location spells addresses, which the form needs. */
  readonly hasHref: boolean;
  /** The panel's controls. */
  readonly children: ReactNode;
};
