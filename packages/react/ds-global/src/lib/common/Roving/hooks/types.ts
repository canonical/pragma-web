import type { RefCallback } from "react";
import type { RovingContextValue, RovingProviderProps } from "../types.js";

/** The props of the provider's state hook: the provider's, without children. */
export type UseProviderStateProps = Omit<RovingProviderProps, "children">;

/** The provider's state, which is the context's value. */
export type UseProviderStateResult = RovingContextValue;

/** The props of a roving item. */
export type UseRovingItemProps = {
  /** The item's id, unique among the items of its composite. */
  id: string;
};

/** What a roving item spreads onto its focusable element. */
export type UseRovingItemResult = {
  /** `0` while the item holds the tab stop, `-1` otherwise. */
  tabIndex: 0 | -1;
  /** Attaches the element the stop focuses. */
  ref: RefCallback<HTMLElement>;
  /** Claims the stop when the element takes focus. */
  onFocus: () => void;
  /** Claims the stop when the element is clicked. */
  onClick: () => void;
  /**
   * The item's id, so that a host can walk its items in document order, as
   * a composite of composed children must.
   */
  "data-roving-item": string;
};
