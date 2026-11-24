/* @canonical/generator-ds 0.9.0-experimental.4 */
import type { ComponentProps } from "react";

type OwnProps = {
  /** Depth of the indentation */
  depth: number;
};

export type IndentationBlockProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
