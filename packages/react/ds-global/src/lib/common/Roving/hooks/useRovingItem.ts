import { useCallback, useContext, useEffect, useRef } from "react";
import Context from "../Context.js";
import type { UseRovingItemProps, UseRovingItemResult } from "./types.js";

/**
 * Makes an element one item of a roving composite. The item is in the tab
 * order only while it holds the stop, claims the stop when it takes focus or
 * is clicked, and takes focus when the host moves the stop onto it. It handles
 * no keys: the host owns them.
 *
 * @param props - The item's id.
 * @returns The props to spread onto the item's element, or `undefined`
 * outside a roving context.
 * @note Impure: focuses the item's element when the stop moves onto it.
 */
const useRovingItem = ({
  id,
}: UseRovingItemProps): UseRovingItemResult | undefined => {
  const context = useContext(Context);
  const activeItem = context?.activeItem;
  const element = useRef<HTMLElement | null>(null);
  const previousActiveItem = useRef(activeItem);

  useEffect(() => {
    const hasMoved = previousActiveItem.current !== activeItem;
    previousActiveItem.current = activeItem;
    if (hasMoved && activeItem === id) element.current?.focus();
  }, [activeItem, id]);

  const ref = useCallback((node: HTMLElement | null) => {
    element.current = node;
  }, []);

  if (!context) return undefined;

  const claimStop = () => {
    if (context.activeItem !== id) context.setActiveItem(id);
  };

  return {
    tabIndex: activeItem === id ? 0 : -1,
    ref,
    onFocus: claimStop,
    onClick: claimStop,
    "data-roving-item": id,
  };
};

export default useRovingItem;
