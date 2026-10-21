import type { EntityBinding } from "@canonical/prism-core";

/** Props accepted by `Status`: the binding whose index it counts. It sits
 * in a strip socket and takes no native props. */
export interface StatusProps {
  /** The binding whose class the index lists. */
  readonly binding: EntityBinding;
}
