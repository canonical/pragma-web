import type { ReactNode } from "react";

/**
 * The roving tab stop a composite shares with its items: one item at a time
 * is in the tab order, and the host moves the stop between them.
 *
 * @experimental The contract serves the query bar's composites and may change.
 */
export type RovingContextValue = {
  /** The id of the item that holds the tab stop. */
  activeItem: string;
  /** Moves the tab stop onto the item with this id. */
  setActiveItem: (id: string) => void;
};

/**
 * Props for RovingProvider, which renders no element of its own: it only
 * shares the tab stop with its children.
 */
export type RovingProviderProps = {
  /** The id of the item that holds the tab stop. */
  activeItem: string;
  /** Called with an item's id when that item claims the stop. */
  onActiveItemChange: (id: string) => void;
  /** The composite, whose items read the stop. */
  children: ReactNode;
};
