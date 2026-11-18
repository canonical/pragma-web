import type { FocusEvent, RefObject } from "react";
import type {
  GetEntryProps,
  GetItemProps,
  GetMenuProps,
  QueryInputOption,
} from "../common/types.js";

/** The props of {@link useActiveItem}. */
export type UseActiveItemProps = {
  /** The item the host says holds the stop, when it controls it. */
  activeItem?: string | undefined;
  /** Called with the item that claims the stop. */
  onActiveItemChange?: ((itemId: string) => void) | undefined;
  /** The toolbar, whose items carry `data-roving-item`. */
  contentRef: RefObject<HTMLElement | null>;
  /** Whether scripts have run, so the items are roving. */
  isMounted: boolean;
};

/** What {@link useActiveItem} returns. */
export type UseActiveItemResult = {
  /** The item that holds the stop. */
  activeItem: string;
  /** Moves the stop: tells the host, and keeps it when the host does not. */
  setActiveItem: (itemId: string) => void;
};

/** The props of {@link useChipLayout}. */
export type UseChipLayoutProps = {
  /** The content row, which holds the chips' list and the entry. */
  contentRef: RefObject<HTMLElement | null>;
};

/** What {@link useChipLayout} returns. */
export type UseChipLayoutResult = {
  /** How many chips do not fit on the field's one line. */
  hiddenCount: number;
  /** Measures again, as when focus enters or leaves the field. */
  measure: () => void;
};

/** The props of {@link useSuggestions}. */
export type UseSuggestionsProps = {
  /** The suggestions. */
  options: QueryInputOption[];
  /** Called with an option's id when it is chosen. */
  onOptionSelect?: ((optionId: string) => void) | undefined;
  /** Called with the highlighted option's id, or undefined, as it changes. */
  onHighlightChange?: ((optionId: string | undefined) => void) | undefined;
  /** The free-text entry's value. */
  value: string;
  /** Whether the suggestions are loading. */
  loading: boolean;
  /** Whether there is empty text to show. */
  hasEmptyText: boolean;
  /** Whether there is a footer hint, which describes the focused entry. */
  hasFooter: boolean;
  /** Whether scripts have run. */
  isMounted: boolean;
  /** Whether the field is disabled, which closes the list and ignores choices. */
  disabled: boolean;
  /** A unique base for the listbox, option, footer and anchor names. */
  baseId: string;
  /** QueryInput's root, inside which focus moves between the entries. */
  rootRef: RefObject<HTMLElement | null>;
};

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
