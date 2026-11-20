import type { GridInteraction } from "@canonical/dataviews-core/bindings";
import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** The table's grid interaction, which every resize path commands. */
  readonly interaction: GridInteraction;
  /** The id of the column this handle resizes. */
  readonly columnId: string;
  /** The column's heading, which the hint names while the edge is placed. */
  readonly name: ReactNode;
  /** The column's currently resolved width, captured when a resize begins. */
  readonly width: number;
  /** The narrowest width a resize may leave, from the column's declared sizing. */
  readonly min: number;
  /** The widest width a resize may leave; infinite when the column has no maximum. */
  readonly max: number;
  /** The id of the element naming this column. */
  readonly labelledBy: string;
  /** Say something through the table's announcer, politely. */
  readonly announce: (message: ReactNode) => void;
};

/**
 * Props of one column's resize handle: its own, and the native props of the
 * `div` it renders as its root, which holds the separator and, while the
 * edge is placed, the hint. The handle draws its own content.
 */
export type ResizeHandleProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
