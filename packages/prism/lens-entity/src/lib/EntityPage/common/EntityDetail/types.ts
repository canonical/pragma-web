import type { EntityBinding } from "@canonical/prism-core";

/**
 * Props accepted by `EntityDetail`: the page's own. It renders no element of
 * its own, so it takes no native props.
 */
export interface EntityDetailProps {
  /** The binding whose class the entity must belong to. */
  readonly binding: EntityBinding;
  /** The lens's name, the document title's tail. */
  readonly label: string;
  /** The entity's address, compact or absolute. */
  readonly uri: string;
}
