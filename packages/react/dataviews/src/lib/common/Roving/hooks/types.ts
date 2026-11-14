import type {
  FocusEventHandler,
  MouseEventHandler,
  Ref,
  RefCallback,
} from "react";
import type { RovingContextValue, RovingProviderProps } from "../types.js";

/**
 * The nearest composite's roving stop, or `undefined` outside one.
 *
 * @experimental The contract serves the query bar's composites and may change.
 */
export type UseRovingStopResult = RovingContextValue | undefined;

/** The props of the provider's state hook: the provider's, without children. */
export type UseProviderStateProps = Omit<RovingProviderProps, "children">;

/** The provider's state, which is the context's value. */
export type UseProviderStateResult = RovingContextValue;

/**
 * The props of a roving item: its id, and the host's own ref and handlers,
 * which the item composes with its own rather than replacing.
 *
 * @experimental The contract serves the query bar's composites and may change.
 */
export type UseRovingItemProps<T extends HTMLElement = HTMLElement> = {
  /**
   * The item's id, unique among the items of its composite, or `undefined`
   * while the element is not an item.
   */
  id: string | undefined;
  /** The host's ref to the element. */
  ref?: Ref<T> | undefined;
  /** The host's focus handler, called before the item claims the stop. */
  onFocus?: FocusEventHandler<T> | undefined;
  /** The host's click handler, called before the item claims the stop. */
  onClick?: MouseEventHandler<T> | undefined;
};

/**
 * What a roving item spreads onto its focusable element.
 *
 * @experimental The contract serves the query bar's composites and may change.
 */
export type UseRovingItemResult<T extends HTMLElement = HTMLElement> = {
  /** `0` while the item holds the tab stop, `-1` otherwise. */
  tabIndex: 0 | -1;
  /** Attaches the element the stop focuses, and the host's ref. */
  ref: RefCallback<T>;
  /** Calls the host's handler, then claims the stop. */
  onFocus: FocusEventHandler<T>;
  /** Calls the host's handler, then claims the stop. */
  onClick: MouseEventHandler<T>;
  /**
   * The item's id, so that a host can walk its items in document order, as
   * a composite of composed children must.
   */
  "data-roving-item": string;
};
