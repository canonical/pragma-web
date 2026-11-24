import type { ReactNode } from "react";

/**
 * Whether children render a name: not a boolean, nullish or an empty string
 * (0 counts).
 *
 * @param children The children.
 * @returns Whether they render something.
 */
export default function hasVisibleChildren(children: ReactNode): boolean {
  return children != null && typeof children !== "boolean" && children !== "";
}
