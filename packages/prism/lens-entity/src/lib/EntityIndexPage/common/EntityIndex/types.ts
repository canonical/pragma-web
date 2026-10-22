import type { EntityBinding } from "@canonical/prism-core";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The binding whose class the index lists. */
  readonly binding: EntityBinding;
};

/**
 * Props accepted by `EntityIndex`: the binding, and the native props of its
 * `<div>` root. The native `children` are excluded: the index renders the
 * class's entries.
 */
export type EntityIndexProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
