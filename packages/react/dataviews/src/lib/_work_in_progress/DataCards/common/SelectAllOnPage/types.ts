import type { ReadonlyChannel, Selection } from "@canonical/dataviews-core";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The collection's selection, which the checkbox changes. */
  readonly selection: Selection;
  /**
   * The displayed identities — the scope this control acts on. Passed as the
   * channel, not its value: this control is mounted only where cards are
   * selectable, and the cards themselves must not re-render for a selection.
   */
  readonly ids: ReadonlyChannel<readonly string[]>;
};

/**
 * Props of the checkbox selecting every card on the page. Its root is the
 * `div` holding the checkbox and its label, so it extends native div props,
 * less `children`, which it renders.
 */
export type SelectAllOnPageProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
