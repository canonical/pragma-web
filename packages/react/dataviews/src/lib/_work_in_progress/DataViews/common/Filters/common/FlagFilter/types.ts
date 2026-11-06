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
  /** The field's visible name. */
  readonly label: string;
  /** The field the control addresses, which names its checkbox. */
  readonly field: string;
  /**
   * Whether the source declares this field's presence predicate. An undeclared
   * one is offered only while it stands, and only for removal.
   */
  readonly declared: boolean;
  /**
   * Whether focus goes to the parent once the restriction the control clears
   * was the field's last: the control is about to leave — an undeclared
   * restriction, or a field shown only because it is restricted, under
   * primary filters — rather than stay where focus could return to it.
   */
  readonly leavesWhenCleared: boolean;
  /**
   * Place focus when the control leaves with the restriction it removed,
   * as an undeclared one does once unchecked: the parent owns where it goes.
   */
  readonly onLeave: () => void;
};

/**
 * Props of one presence filter: its own, and the native props of the `div`
 * it renders as its root.
 */
export type FlagFilterProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
