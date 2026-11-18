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
  /**
   * Claims the tab stop for the item with this id, from focus already on
   * that item or inside it, so the item takes the stop without taking focus.
   */
  setActiveItem: (id: string) => void;
  /** Whether the stop now on this item came from a claim, not a host move. */
  isClaimed: (id: string | undefined) => boolean;
  /**
   * Adds an element to the composite, such as an item or a part that holds
   * items; returns its removal.
   */
  registerMember: (element: Element) => () => void;
  /**
   * Whether focus is inside the composite, or lost to the document because
   * the element holding it left. Only then does a host's move of the stop
   * also move focus.
   */
  hasFocusWithin: () => boolean;
  /**
   * Whether the stop has moved since the composite mounted. An item that
   * mounts holding a stop that has moved takes focus, as when a host swaps
   * one item for another; on the first load it does not.
   */
  hasMoved: boolean;
};

/**
 * Props for RovingProvider, which renders no element of its own: it only
 * shares the tab stop with its children.
 *
 * @experimental The contract serves the query bar's composites and may change.
 */
export type RovingProviderProps = {
  /** The id of the item that holds the tab stop. */
  activeItem: string;
  /** Called with an item's id when that item claims the stop. */
  onActiveItemChange: (id: string) => void;
  /** The composite, whose items read the stop. */
  children: ReactNode;
};
