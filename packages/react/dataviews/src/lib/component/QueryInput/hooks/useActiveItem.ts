import { useCallback, useLayoutEffect, useState } from "react";
import { ENTRY_ITEM_ID } from "../common/constants.js";
import type { UseActiveItemProps, UseActiveItemResult } from "./types.js";

/**
 * Holds the roving item that has the toolbar's tab stop: the host's, when it
 * passes `activeItem`, or QueryInput's own, which starts on the entry. When
 * the item holding the stop is gone or disabled, as after a chip's removal,
 * the stop falls back to the entry, so the toolbar stays in the tab order.
 *
 * @param props - The host's item and change handler, both optional, and the
 * toolbar the items sit in.
 * @returns The item that holds the stop, and its setter.
 * @note Impure: reads the toolbar's items after each render.
 */
export default function useActiveItem({
  activeItem,
  onActiveItemChange,
  contentRef,
  isMounted,
}: UseActiveItemProps): UseActiveItemResult {
  const [ownItem, setOwnItem] = useState(ENTRY_ITEM_ID);
  const current = activeItem ?? ownItem;
  const setActiveItem = useCallback(
    (itemId: string) => {
      setOwnItem(itemId);
      onActiveItemChange?.(itemId);
    },
    [onActiveItemChange],
  );

  useLayoutEffect(() => {
    if (!isMounted || current === ENTRY_ITEM_ID) return;
    const items = contentRef.current?.querySelectorAll("[data-roving-item]");
    const isPresent = [...(items ?? [])].some(
      (item) =>
        item.getAttribute("data-roving-item") === current &&
        !item.matches(":disabled"),
    );
    if (!isPresent) setActiveItem(ENTRY_ITEM_ID);
  });

  return { activeItem: current, setActiveItem };
}
