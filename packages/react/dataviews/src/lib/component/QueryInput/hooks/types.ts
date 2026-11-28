import type { FocusEvent, RefObject } from "react";
import type {
  GetEntryProps,
  GetItemProps,
  GetMenuProps,
  QueryInputOption,
} from "../common/types.js";

/**
 * The props of {@link useActiveItem}: the toolbar, whose items carry
 * `data-roving-item`, whether scripts have run, then the host's item and
 * change handler.
 */
export type UseActiveItemProps = readonly [
  contentRef: RefObject<HTMLElement | null>,
  isMounted: boolean,
  options?: {
    /** The item the host says holds the stop, when it controls it. */
    activeItem?: string | undefined;
    /** Called with the item that claims the stop. */
    onActiveItemChange?: ((itemId: string) => void) | undefined;
  },
];

/** What {@link useActiveItem} returns. */
export type UseActiveItemResult = {
  /** The item that holds the stop. */
  activeItem: string;
  /** Moves the stop: tells the host, and keeps it when the host does not. */
  setActiveItem: (itemId: string) => void;
};

/**
 * The props of {@link useChipLayout}: the content row, which holds the chips'
 * list and the entry.
 */
export type UseChipLayoutProps = readonly [
  contentRef: RefObject<HTMLElement | null>,
];

/** What {@link useChipLayout} returns. */
export type UseChipLayoutResult = {
  /** How many chips do not fit on the field's one line. */
  hiddenCount: number;
  /** Measures again, as when focus enters or leaves the field. */
  measure: () => void;
};

/** What {@link useSuggestions} takes. */
export type UseSuggestionsProps = readonly [
  suggestions: QueryInputOption[],
  value: string,
  isMounted: boolean,
  baseId: string,
  rootRef: RefObject<HTMLElement | null>,
  options?: {
    /** Whether the suggestions are loading. */
    loading?: boolean | undefined;
    /** Whether there is text to show when nothing matches. */
    hasEmptyText?: boolean | undefined;
    /** Whether there is a footer hint. */
    hasFooter?: boolean | undefined;
    /** Whether the field is disabled. */
    disabled?: boolean | undefined;
    /** Called with an option's id when it is chosen. */
    onOptionSelect?: ((optionId: string) => void) | undefined;
    /** Called with the highlighted option's id, or undefined, as it changes. */
    onHighlightChange?: ((optionId: string | undefined) => void) | undefined;
  },
];

/** What {@link useSuggestions} returns. */
export type UseSuggestionsResult = {
  /** Whether the suggestions show. */
  isOpen: boolean;
  /** Whether an entry has focus. */
  hasFocus: boolean;
  /** The footer hint's id. */
  footerId: string;
  /** The CSS anchor name the focused entry carries. */
  anchorName: string;
  /** downshift's listbox props. */
  getMenuProps: GetMenuProps;
  /** downshift's option props. */
  getItemProps: GetItemProps;
  /** Closes the list when focus lands in the field outside the entries. */
  closeOnFocusElsewhere: (event: FocusEvent<HTMLElement>) => void;
  /**
   * Merges the combobox props into an entry input's own: downshift's for
   * the entry that has focus, a collapsed combobox for the other.
   */
  getEntryProps: GetEntryProps;
};
