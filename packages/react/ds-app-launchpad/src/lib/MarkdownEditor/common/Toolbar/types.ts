/* @canonical/generator-ds 0.9.0-experimental.4 */
import type { ComponentProps } from "react";
import type {
  ToolbarButtonProps,
  ToolbarGroupProps,
  ToolbarSeparatorProps,
} from "./common/index.js";

type OwnProps = {
  /** Toolbar label (also the toolbar's accessible name). */
  label: string;
};

export type ToolbarProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;

export type ToolbarComponent = ((props: ToolbarProps) => React.ReactElement) & {
  Button: (props: ToolbarButtonProps) => React.ReactElement | null;
  Group: (props: ToolbarGroupProps) => React.ReactElement | null;
  Separator: (props: ToolbarSeparatorProps) => React.ReactElement | null;
};
