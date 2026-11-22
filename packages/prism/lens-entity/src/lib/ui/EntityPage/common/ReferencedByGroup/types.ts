import type { ComponentProps } from "react";
import type { StatementGroup_group$key } from "../../../../../__generated__/StatementGroup_group.graphql.js";

type OwnProps = {
  /** The group's title: its label from the entity's side and its count. */
  readonly title: string;
  /**
   * The Relay fragment key of the incoming group, from an operation that
   * spreads `...StatementGroup_group`.
   */
  readonly group: StatementGroup_group$key;
};

/**
 * Props accepted by `ReferencedByGroup`: the title, the group and the native
 * props of its root `<section>`. The native `children` are excluded: the
 * group renders its title and its values.
 */
export type ReferencedByGroupProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps | "children">;
