import type { TermFlowNode } from "../../types.js";

/** Props accepted by `TermNode`. */
export interface TermNodeProps {
  /** The positioned, decorated class node to draw. */
  readonly node: TermFlowNode;
}
