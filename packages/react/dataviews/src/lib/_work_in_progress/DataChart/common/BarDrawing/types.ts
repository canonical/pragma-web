import type { FacetValue } from "@canonical/dataviews-core";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The chart's label, which captions the table and names the drawing. */
  readonly label: string;
  /** The values drawn, in the source's order; never empty. */
  readonly values: readonly FacetValue[];
};

/**
 * Props of the bar drawing. Its root is a `div` holding the drawing and its
 * table, so it extends native div props, less `children`, which it draws.
 */
export type BarDrawingProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
