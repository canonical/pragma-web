import type { ComponentProps } from "react";

type OwnProps = {
  /** The chart's label, which captions the table and names the drawing. */
  readonly label: string;
  /** The least value any matching record holds. */
  readonly min: number;
  /** The greatest value any matching record holds. */
  readonly max: number;
  /** The field's declared least value, where the schema declares one. */
  readonly lowerBound: number | undefined;
  /** The field's declared greatest value, where the schema declares one. */
  readonly upperBound: number | undefined;
};

/**
 * Props of the range drawing. Its root is a `div` holding the drawing and its
 * table, so it extends native div props, less `children`, which it draws.
 */
export type RangeDrawingProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
