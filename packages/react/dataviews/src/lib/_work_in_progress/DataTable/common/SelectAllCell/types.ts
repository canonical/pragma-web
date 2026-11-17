import type { ReadonlyChannel, Selection } from "@canonical/dataviews-core";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The collection's selection, which the checkbox adds to and removes from. */
  readonly selection: Selection;
  /**
   * The displayed row identities — the scope this control acts on. Passed
   * as the channel, not its value: this is the only consumer of it, so a
   * table rendering no selection column must not re-render for it.
   */
  readonly ids: ReadonlyChannel<readonly string[]>;
  /**
   * Attaches this cell to the table's geometry. The stylesheet sizes the
   * selection track, and the columns share whatever width it leaves.
   */
  readonly reserve: (cell: HTMLDivElement) => () => void;
};

/**
 * Props of the select-all header cell: its own, and the native props of the
 * `div` it renders as its root. The cell owns its role, and its ref is the
 * table's geometry, so neither is taken.
 */
export type SelectAllCellProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children" | "role" | "ref">;
