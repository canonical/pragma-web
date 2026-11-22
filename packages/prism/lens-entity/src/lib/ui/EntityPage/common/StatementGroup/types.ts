import type { ComponentProps } from "react";
import type { StatementGroup_group$key } from "../../../../../__generated__/StatementGroup_group.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of one predicate group, from an operation that
   * spreads `...StatementGroup_group`.
   */
  readonly group: StatementGroup_group$key;
};

/**
 * Props accepted by `StatementGroup`: the group and the native props of its root `<div>`. The native `children`
 * are excluded: the group renders its values.
 */
export type StatementGroupProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
