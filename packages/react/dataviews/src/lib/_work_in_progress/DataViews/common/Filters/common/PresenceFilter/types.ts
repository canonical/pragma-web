import type { Count, FilterHandle } from "@canonical/dataviews-core";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The root's handle for this field's presence predicate. */
  readonly handle: FilterHandle<boolean>;
  /**
   * How many matching records set the field, from the facet answering the
   * applied query, or null while none does.
   */
  readonly count: Count | null;
  /** The field's visible name, which names the group. */
  readonly label: string;
  /** The field the control addresses, which names its radios. */
  readonly field: string;
  /**
   * Whether the source declares this field's presence predicate. An undeclared
   * one is offered only while it stands, and only for removal.
   */
  readonly declared: boolean;
  /**
   * Hear whether focus is inside the group: while it is, the group stays,
   * and the parent keeps it where it stands.
   */
  readonly onHold: (holding: boolean) => void;
};

/**
 * Props of one presence filter: its own, and the native props of the
 * `fieldset` it renders as its root.
 */
export type PresenceFilterProps = OwnProps &
  Omit<ComponentProps<"fieldset">, keyof OwnProps | "children">;
