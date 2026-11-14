import {
  type UseComboboxState,
  type UseComboboxStateChangeOptions,
  useCombobox,
} from "downshift";
import type { FocusEvent, KeyboardEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { QueryEntryInputProps } from "../../../common/QueryEntry/index.js";
import type { EntryKind, QueryInputOption } from "../common/types.js";
import type { UseSuggestionsProps, UseSuggestionsResult } from "./types.js";

const { stateChangeTypes } = useCombobox;

/** Whether an option can be chosen: neither disabled nor already held. */
const isOptionDisabled = (option: QueryInputOption): boolean =>
  Boolean(option.disabled || option.current);

/**
 * An option's text for downshift, which also asks for the text of no option,
 * as after a second choice, since the selection is held empty.
 */
const readOptionLabel = (option: QueryInputOption | null): string =>
  option ? option.label : "";

/**
 * Keeps blur from choosing: downshift chooses the highlighted option when the
 * entry loses focus, and in a query field focus moving on ends nothing.
 */
const keepSelectionOnBlur = (
  state: UseComboboxState<QueryInputOption>,
  { type, changes }: UseComboboxStateChangeOptions<QueryInputOption>,
): Partial<UseComboboxState<QueryInputOption>> =>
  type === stateChangeTypes.InputBlur
    ? { ...changes, selectedItem: state.selectedItem }
    : changes;

/** Marks a key event as one downshift leaves to the host. */
const leaveToHost = (event: KeyboardEvent<HTMLInputElement>): void => {
  (
    event.nativeEvent as { preventDownshiftDefault?: boolean }
  ).preventDownshiftDefault = true;
};

/**
 * QueryInput's suggestions on downshift's `useCombobox`, shared by its own
 * entry and a chip's: downshift's input props go to whichever entry has
 * focus, and the other reads as a collapsed combobox. The list opens while an
 * entry has focus, there is something to show and Escape has not dismissed
 * it; Down reopens it, as does typing. Focus moving between the entries keeps
 * it open. Keys the combobox does not handle reach the entry's own handler,
 * which is the host's.
 *
 * @param props - The options, the choice handler and what the list can show.
 * @returns The list state, downshift's list getters and the entry merger.
 */
export default function useSuggestions({
  options,
  onOptionSelect,
  onHighlightChange,
  value,
  loading,
  hasEmptyText,
  hasFooter,
  isMounted,
  disabled,
  baseId,
  rootRef,
}: UseSuggestionsProps): UseSuggestionsResult {
  const [focusedEntry, setFocusedEntry] = useState<EntryKind | null>(null);
  const [isDismissed, setDismissed] = useState(false);
  // Kept by id, so a highlight never names another option after a change.
  const [highlightedId, setHighlightedId] = useState<string>();

  const hasContent = options.length > 0 || loading || hasEmptyText;
  // A field disabled with focus in it gets no blur in Firefox: disabled
  // alone closes the list.
  const hasFocus = focusedEntry !== null && !disabled;
  const isOpen = isMounted && hasFocus && !isDismissed && hasContent;
  const highlightedIndex = isOpen
    ? options.findIndex(
        (option) => option.id === highlightedId && !isOptionDisabled(option),
      )
    : -1;
  const listboxId = `${baseId}-listbox`;
  const footerId = `${baseId}-footer`;
  const anchorName = `--query-input-${baseId.replace(/[^\w-]/g, "")}`;

  const combobox = useCombobox<QueryInputOption>({
    items: options,
    itemToString: readOptionLabel,
    isItemDisabled: isOptionDisabled,
    isOpen,
    highlightedIndex,
    inputValue: value,
    selectedItem: null,
    menuId: listboxId,
    inputId: `${baseId}-entry`,
    labelId: `${baseId}-label`,
    getItemId: (index) =>
      `${baseId}-option-${encodeURIComponent(String(options.at(index)?.id))}`,
    stateReducer: keepSelectionOnBlur,
    onStateChange: ({ type, highlightedIndex: index, selectedItem }) => {
      if (selectedItem && !disabled) onOptionSelect?.(selectedItem.id);
      if (type === stateChangeTypes.InputKeyDownEscape) setDismissed(true);
      // A dismissal lasts until the next input, Down or Alt+Down; a click
      // keeps it.
      if (
        type === stateChangeTypes.InputChange ||
        type === stateChangeTypes.InputKeyDownArrowDown
      ) {
        setDismissed(false);
      }
      if (index !== undefined) {
        setHighlightedId(index >= 0 ? options.at(index)?.id : undefined);
      }
    },
  });

  // downshift checks, once on mount, that its getters were called. No entry
  // takes its input props until one has focus, and before scripts run there
  // is no listbox, so both are registered here without an element.
  if (focusedEntry === null) {
    combobox.getInputProps({}, { suppressRefError: true });
  }
  if (!isMounted) combobox.getMenuProps({}, { suppressRefError: true });

  /**
   * Ends the entries' focus when focus lands on something else in the
   * field. A chip's Entry can unmount with focus in it, and no blur fires
   * then in Firefox, so the list would stay open, cut off from focus.
   */
  const endFocus = (): void => {
    setFocusedEntry(null);
    setHighlightedId(undefined);
    setDismissed(false);
  };
  // The focused entry's element, which can unmount without a blur. A field
  // disabled with focus in it gets no blur in Firefox either, so being
  // disabled ends focus too: enabled again, nothing in it has focus.
  const focusedElement = useRef<HTMLInputElement | null>(null);
  useLayoutEffect(() => {
    if (
      focusedEntry !== null &&
      (disabled || !focusedElement.current?.isConnected)
    ) {
      endFocus();
    }
  });

  // The host hears the highlighted option, which Tab and blur commit.
  const highlighted =
    highlightedIndex >= 0 ? options.at(highlightedIndex)?.id : undefined;
  const reportedHighlight = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (reportedHighlight.current === highlighted) return;
    reportedHighlight.current = highlighted;
    onHighlightChange?.(highlighted);
  }, [highlighted, onHighlightChange]);
  const isElsewhereInRoot = (element: Element): boolean =>
    rootRef.current?.contains(element) === true &&
    element.getAttribute("role") !== "combobox";

  /** Whether the combobox handles a key; the rest go to the host. */
  const isComboboxKey = (key: string): boolean => {
    if (key === "ArrowDown") return hasContent;
    if (key === "Enter") return isOpen && highlightedIndex !== -1;
    return ["ArrowUp", "Escape", "PageUp", "PageDown"].includes(key) && isOpen;
  };

  const getEntryProps = (
    entry: EntryKind,
    props: QueryEntryInputProps,
  ): QueryEntryInputProps => {
    const handleFocus = (event: FocusEvent<HTMLInputElement>): void => {
      props.onFocus?.(event);
      // A dismissal lasts only while the same entry keeps focus.
      if (focusedEntry !== entry) setDismissed(false);
      focusedElement.current = event.currentTarget;
      setFocusedEntry(entry);
    };
    const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
      props.onBlur?.(event);
      const next = event.relatedTarget;
      // Moving to the other entry keeps the list: its focus takes it over.
      const isOtherEntry =
        next instanceof HTMLElement &&
        rootRef.current?.contains(next) === true &&
        next.getAttribute("role") === "combobox";
      if (isOtherEntry) return;
      setFocusedEntry(null);
      setHighlightedId(undefined);
      setDismissed(false);
    };

    if (focusedEntry !== entry) {
      return {
        ...props,
        role: "combobox",
        autoComplete: "off",
        "aria-autocomplete": "list",
        "aria-expanded": false,
        onFocus: handleFocus,
        onBlur: handleBlur,
      };
    }

    const { onKeyDown, ...rest } = props;
    // The entry's native props are downshift's input options.
    const inputOptions = {
      ...rest,
      "aria-describedby":
        [props["aria-describedby"], isOpen && hasFooter && footerId]
          .filter(Boolean)
          .join(" ") || undefined,
      style: { ...props.style, anchorName },
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: (event) => {
        if (isComboboxKey(event.key)) return;
        leaveToHost(event);
        onKeyDown?.(event);
      },
    } as Parameters<typeof combobox.getInputProps>[0];
    return combobox.getInputProps(inputOptions);
  };

  return {
    isOpen,
    hasFocus,
    footerId,
    anchorName,
    getMenuProps: combobox.getMenuProps,
    getItemProps: combobox.getItemProps,
    getEntryProps,
    // @note Impure: reads the element that took focus.
    closeOnFocusElsewhere: (event) => {
      if (focusedEntry !== null && isElsewhereInRoot(event.target as Element)) {
        endFocus();
      }
    },
  };
}
