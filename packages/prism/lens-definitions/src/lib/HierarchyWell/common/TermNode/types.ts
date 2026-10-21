import type { ComponentProps } from "react";
import type { TermFlowNode } from "../../types.js";

type OwnProps = {
  /** The positioned, decorated class node to draw. */
  readonly node: TermFlowNode;
};

/**
 * Props accepted by `TermNode`: the node it draws, and the native props of
 * its root `<div>`.
 */
export type TermNodeProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
