import type { ComponentProps } from "react";
import type { StatementGroup_group$key } from "../../../../../__generated__/StatementGroup_group.graphql.js";

type OwnProps = {
  /**
   * The Relay fragment key of one predicate group, from an operation that
   * spreads `...StatementGroup_group`.
   */
  readonly group: StatementGroup_group$key;
  /**
   * Where every value of the group is listed: the index that holds all of
   * them. "All N" follows the shown values only when it is given and the
   * group holds more values than it shows.
   */
  readonly allHref?: string;
};

/**
 * Props accepted by `StatementGroup`: the group, where all its values are
 * listed, and the native props of its root `<div>`. The native `children`
 * are excluded: the group renders its values.
 */
export type StatementGroupProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
