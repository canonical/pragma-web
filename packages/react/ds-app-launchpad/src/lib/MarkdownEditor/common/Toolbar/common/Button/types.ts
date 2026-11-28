/* @canonical/generator-ds 0.9.0-experimental.4 */
import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** Toolbar button label */
  label: string;
  /** The shortcut key to trigger the button */
  shortcut?: string;
  /** Button contents (icon). */
  children?: ReactNode;
};

export type ToolbarButtonProps = OwnProps &
  Omit<ComponentProps<"button">, keyof OwnProps>;
