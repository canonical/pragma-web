import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Context from "../Context.js";
import type { UseRovingItemProps, UseRovingItemResult } from "./types.js";

/**
 * Makes an element one item of a roving composite. The item is in the tab
 * order only while it holds the stop, claims the stop when it takes focus or
 * is clicked, and takes focus when the host moves the stop onto it, or when
 * it mounts holding a stop that has moved since the composite mounted, as
 * long as focus is inside the composite or lost; a stop that arrives
 * through a claim leaves focus where it is. It
 * handles no keys: the host owns them. The host's ref and handlers are
 * composed with the item's.
 *
 * @param props - The item's id, or `undefined` while the element is not an
 * item, and the host's ref and handlers.
 * @returns The props to spread onto the item's element, or `undefined`
 * outside a roving context or while the element is not an item.
 * @note Impure: focuses the item's element when the stop arrives on it.
 */
export default function useRovingItem<T extends HTMLElement = HTMLElement>({
  id,
  ref: hostRef,
  onFocus,
  onClick,
}: UseRovingItemProps<T>): UseRovingItemResult<T> | undefined {
  const context = useContext(Context);
  const activeItem = context?.activeItem;
  // In state, so that an element attaching after the stop arrived is seen.
  const [element, setElement] = useState<T | null>(null);
  const hasRun = useRef(false);
  const previousActiveItem = useRef(activeItem);
  const isArrivalPending = useRef(false);

  useEffect(() => {
    // Outside a roving context there is no stop to arrive.
    if (!context) return;
    // On its first run the item has just mounted: the stop arrives with it
    // only if it has moved since the composite mounted, so a first load
    // takes no focus. Later, it arrives when it changes.
    const hasArrived = hasRun.current
      ? previousActiveItem.current !== activeItem
      : context.hasMoved;
    hasRun.current = true;
    previousActiveItem.current = activeItem;
    // An arrival waits for the element, which may attach on a later render.
    isArrivalPending.current =
      activeItem === id && (hasArrived || isArrivalPending.current);
    if (isArrivalPending.current && element) {
      isArrivalPending.current = false;
      // A claim comes from focus already on the item or inside its part,
      // which keeps it. A host's move takes focus along only from inside
      // the composite, or from a document whose focused element left.
      if (!context.isClaimed(id) && context.hasFocusWithin()) element.focus();
    }
  }, [context, activeItem, id, element]);

  // The element is a member of the composite while it is attached.
  const registerMember = context?.registerMember;
  useEffect(
    () => (element && registerMember ? registerMember(element) : undefined),
    [element, registerMember],
  );

  const ref = useCallback(
    (node: T | null) => {
      setElement(node);
      if (typeof hostRef === "function") hostRef(node);
      else if (hostRef) hostRef.current = node;
    },
    [hostRef],
  );

  if (!context || id === undefined) return undefined;

  const claimStop = () => {
    if (context.activeItem !== id) context.setActiveItem(id);
  };

  return {
    tabIndex: activeItem === id ? 0 : -1,
    ref,
    onFocus: (event) => {
      onFocus?.(event);
      claimStop();
    },
    onClick: (event) => {
      onClick?.(event);
      claimStop();
    },
    "data-roving-item": id,
  };
}
