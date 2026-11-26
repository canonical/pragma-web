import type { ReactElement } from "react";
import { useRovingItem } from "../../../../common/Roving/index.js";
import { ENTRY_ITEM_ID } from "../constants.js";
import type { EntryProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds query-input-entry";

/**
 * QueryInput's free-text entry, the toolbar's `entry` item. Before scripts
 * run it is a plain search input, which submits with the host's GET form
 * when it has a `name`, and is inert without one. Once they run it is the
 * combobox that controls the suggestions.
 */
export default function Entry({
  isMounted,
  getEntryProps,
  ref,
  onFocus,
  onClick,
  ...props
}: EntryProps): ReactElement {
  // The host's ref and handlers are composed with the item's.
  const rovingItem = useRovingItem<HTMLInputElement>({
    id: ENTRY_ITEM_ID,
    ref,
    onFocus,
    onClick,
  });

  if (!isMounted || !rovingItem) {
    return (
      <input
        {...props}
        ref={ref}
        onFocus={onFocus}
        onClick={onClick}
        type="search"
        className={componentCssClassName}
        disabled={props.disabled || props.name === undefined}
      />
    );
  }

  return (
    <input
      {...getEntryProps("own", { ...props, ...rovingItem })}
      type="text"
      className={componentCssClassName}
    />
  );
}
