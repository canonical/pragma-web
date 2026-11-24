import type { PredicateCondition } from "@canonical/dataviews-core";
import type { ComponentProps } from "react";

/** The Condition values a mark is drawn for: what a clause asserts. */
export type ConditionMarkCondition = PredicateCondition;

/** ConditionMark's own props. */
type OwnProps = {
  /** The Condition value whose mark is drawn. */
  readonly condition: ConditionMarkCondition;
};

/**
 * Props of a Condition's mark. The root is a `<span>` and takes its native
 * props, apart from `children`, since it draws a glyph, and `aria-hidden`,
 * since the words beside it always say what it shows.
 */
export type ConditionMarkProps = OwnProps &
  Omit<ComponentProps<"span">, keyof OwnProps | "children" | "aria-hidden">;
