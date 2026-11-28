/* @canonical/generator-canonical-ds 0.0.1 */
import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** Shown by default */
  hideCollapse?: boolean;
  showChangeCount?: boolean;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
};

export type FileHeaderProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
