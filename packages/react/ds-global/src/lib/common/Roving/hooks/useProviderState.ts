import { useMemo } from "react";
import type { UseProviderStateProps, UseProviderStateResult } from "./types.js";

/**
 * Holds the roving provider's state: the item that holds the tab stop, and a
 * setter that reports a claim to the host, which owns the stop.
 *
 * @param props - The active item and the host's change handler.
 * @returns The context value, stable while its inputs are.
 */
const useProviderState = ({
  activeItem,
  onActiveItemChange,
}: UseProviderStateProps): UseProviderStateResult =>
  useMemo(
    () => ({ activeItem, setActiveItem: onActiveItemChange }),
    [activeItem, onActiveItemChange],
  );

export default useProviderState;
