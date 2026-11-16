import type { ReactNode } from "react";
import type { PanelState } from "./hooks/types.js";

/** Internal renderer props: the shared state, and the menu it holds. */
export type PanelProps = {
  /** The state the trigger and its popover share. */
  panel: PanelState;
  /** The menu. */
  children: ReactNode;
};
