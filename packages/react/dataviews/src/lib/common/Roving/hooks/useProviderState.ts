import { useCallback, useMemo, useRef, useState } from "react";
import type { UseProviderStateProps, UseProviderStateResult } from "./types.js";

/**
 * Holds the roving provider's state: the item that holds the tab stop, a
 * setter that reports a claim to the host, which owns the stop, whether the
 * stop has moved since the composite mounted, whether the stop's latest
 * arrival came from a claim, and the composite's members, which say whether
 * focus is inside it.
 *
 * @param props - The active item and the host's change handler.
 * @returns The context value, stable while its inputs are.
 */
export default function useProviderState({
  activeItem,
  onActiveItemChange,
}: UseProviderStateProps): UseProviderStateResult {
  const [initialActiveItem] = useState(activeItem);
  const [hasMoved, setHasMoved] = useState(false);
  // Derived during render, so the first render after the move already sees it.
  if (!hasMoved && activeItem !== initialActiveItem) setHasMoved(true);
  // The id the latest claim asked for, until the stop moves elsewhere.
  const claimedItem = useRef<string | undefined>(undefined);
  if (claimedItem.current !== activeItem) claimedItem.current = undefined;

  const setActiveItem = useCallback(
    (id: string) => {
      claimedItem.current = id;
      onActiveItemChange(id);
    },
    [onActiveItemChange],
  );
  const isClaimed = useCallback(
    (id: string | undefined) => claimedItem.current === id,
    [],
  );
  const members = useRef(new Set<Element>());
  const registerMember = useCallback((element: Element) => {
    members.current.add(element);
    return () => {
      members.current.delete(element);
    };
  }, []);
  const hasFocusWithin = useCallback(() => {
    const focused = document.activeElement;
    return (
      focused === null ||
      focused === document.body ||
      [...members.current].some((member) => member.contains(focused))
    );
  }, []);

  return useMemo(
    () => ({
      activeItem,
      setActiveItem,
      isClaimed,
      registerMember,
      hasFocusWithin,
      hasMoved: hasMoved || activeItem !== initialActiveItem,
    }),
    [
      activeItem,
      setActiveItem,
      isClaimed,
      registerMember,
      hasFocusWithin,
      hasMoved,
      initialActiveItem,
    ],
  );
}
