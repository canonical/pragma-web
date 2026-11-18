import type { ReactElement } from "react";
import { useCallback, useContext } from "react";
import {
  DropdownPanelStandIn as DropdownPanel,
  type DropdownPanelHandle,
} from "../../../../common/withDropdownButtonStandIn/index.js";
import { useMergedRef } from "../../../../hooks/index.js";
import Context from "../Context.js";
import type { PanelProps } from "./types.js";

/**
 * FilterButton's panel: the dropdown's panel, named by the trigger, holding
 * the content FilterButton passes through its context. The dropdown's handle
 * and the host's `panelRef` both receive the panel's handle.
 */
export default function Panel({
  ref,
  id,
  triggerId,
}: PanelProps): ReactElement {
  const context = useContext(Context);
  if (!context) {
    throw new Error("FilterButton's panel renders only inside FilterButton.");
  }
  const { children, onToggle, panelRef } = context;

  // @note Impure: the dropdown's ref and the host's both get the handle.
  const attachHandle = useMergedRef(
    panelRef,
    useCallback(
      (handle: DropdownPanelHandle) => {
        ref.current = handle;
        return () => {
          ref.current = null;
        };
      },
      [ref],
    ),
  );

  return (
    <DropdownPanel
      ref={attachHandle}
      id={id}
      aria-labelledby={triggerId}
      onToggle={onToggle}
    >
      {children}
    </DropdownPanel>
  );
}
