import type {
  FilterHandle,
  PredicateOperator,
} from "@canonical/dataviews-core";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The root's handle for the text this field must contain or start with. */
  readonly handle: FilterHandle<string>;
  /** Which text operator this control edits. */
  readonly operator: Extract<PredicateOperator, "contains" | "startsWith">;
  /** The field's visible name; the operator's wording is added to it. */
  readonly label: string;
  /** The field the control addresses, which names its input. */
  readonly field: string;
  /**
   * Whether the source declares the operator on this field. An undeclared
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
   * as an undeclared one does once cleared: the parent owns where it goes.
   */
  readonly onLeave: () => void;
};

/**
 * Props of one text filter: its own, and the native props of the
 * `div` it renders as its root.
 */
export type TextFilterProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
