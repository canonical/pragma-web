import type { LinkComponent } from "@canonical/react-ds-global";
import type { ComponentProps, ReactNode } from "react";
import type { QueryChipCondition } from "../QueryChip/index.js";

/**
 * The Condition of what applies to a filter's words, which picks the mark
 * shown after its name.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type FilterOptionsCondition = QueryChipCondition;

/**
 * One word of a filter's options: a value, or "All", with where it leads
 * and whether it applies.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type FilterOptionsOption = {
  /** What tells the word apart from the others, unique among them. */
  readonly value: string;
  /** The word shown. */
  readonly label: string;
  /**
   * Where choosing the word leads. With one, the word is a link; without,
   * it is a button once scripts run, and inert text before.
   */
  readonly href?: string | undefined;
  /** Whether the query holds the word's condition. */
  readonly current: boolean;
  /**
   * The word's name while the query excludes its value, in the host's
   * words, such as "broken, excluded". Given, the word is excluded: it
   * shows the Exclusion mark, and its name says so.
   */
  readonly excludedLabel?: string | undefined;
  /** The number of records the word matches, spelled, shown after it. */
  readonly count?: string | undefined;
  /**
   * Chooses the word once scripts run. A word with an `href` calls it on a
   * plain click in place of following the address, through a router's
   * `LinkComponent` too; a click for a new tab still follows it.
   */
  readonly onSelect?: (() => void) | undefined;
};

/** FilterOptions's own props. */
type OwnProps = {
  /** The filter's name, shown before its words. */
  label: ReactNode;
  /** The words, in order. */
  options: readonly FilterOptionsOption[];
  /**
   * Whether several words apply at once, as checkboxes do. A button then
   * says it is pressed; with one word at a time, it is the current one.
   */
  multiple?: boolean | undefined;
  /**
   * The Condition of what applies to the filter, where it holds one; its
   * mark shows after the name while `appliedLabel` says what applies.
   */
  condition?: FilterOptionsCondition | undefined;
  /**
   * The resolved words for what applies, such as "none of 2", from the
   * host's messages: the group's name carries them after the label.
   */
  appliedLabel?: string | undefined;
  /**
   * The link each word with an `href` renders through: a router's own, or
   * the intrinsic anchor by default.
   */
  LinkComponent?: LinkComponent | undefined;
};

/**
 * FilterOptions's props. The root is a `<div>` and takes its native props,
 * apart from `children`, which the words are, and `role`, which the group
 * fixes.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type FilterOptionsProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children" | "role">;
