/* @canonical/generator-ds 0.9.0-experimental.4 */
import type { ComponentProps } from "react";
import type { EditMode } from "../../types.js";

type OwnProps = {
  /** The current edit mode */
  editMode: EditMode;
  /** Callback for edit mode change */
  onEditModeChange: (mode: EditMode, eventType: "click" | "keydown") => void;
  ariaLabelMessage?: string;
};

export type ViewModeTabsProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
