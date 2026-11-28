/* @canonical/generator-ds 0.9.0-experimental.4 */
import type { ComponentProps } from "react";

type OwnProps = {
  /** Toolbar group label (also the group's accessible name). */
  label: string;
};

export type ToolbarGroupProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
