import type { ComponentProps, ReactNode } from "react";

/** One row of the suggestions list. */
export interface PromptInputSuggestion {
  id: string;
  /** The row's text. It is cut short with an ellipsis when it does not fit. */
  label: string;
  /** A decorative glyph shown before the label, such as an `<Icon>`. */
  icon?: ReactNode;
  /**
   * Short tags shown at the end of the row. The first two are shown and the
   * rest are counted, as in `+3`.
   */
  tags?: string[];
}

/** A labelled group of rows, such as "History" or "Tickets". */
export interface PromptInputSuggestionGroup {
  id: string;
  /** The group's visible heading, which also names it for assistive tech. */
  label: string;
  items: PromptInputSuggestion[];
}

type OwnProps = {
  /**
   * The listbox id. The prompt's textarea points at it, and each row's id is
   * derived from it with `getOptionId`.
   */
  id: string;
  /** Groups without items are left out. */
  groups: PromptInputSuggestionGroup[];
  activeOptionId?: string;
  onSelect: (
    suggestion: PromptInputSuggestion,
    group: PromptInputSuggestionGroup,
  ) => void;
};

/**
 * Props extend the native props of the `<div>` listbox root. Pass an
 * `aria-label` to name the list.
 */
export type SuggestionsProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
