import { Button, Icon } from "@canonical/react-ds-global";
import type { MouseEvent, ReactElement, ReactNode } from "react";
import { Children, isValidElement, useCallback, useId, useRef } from "react";
import { QueryEntryProvider } from "../../common/QueryEntry/index.js";
import { RovingProvider } from "../../common/Roving/index.js";
import { useIsHydrated, useMergedRef } from "../../hooks/index.js";
import { ENTRY_ITEM_ID } from "./common/constants.js";
import { Entry } from "./common/Entry/index.js";
import { StopClaim } from "./common/StopClaim/index.js";
import { Suggestions } from "./common/Suggestions/index.js";
import { useActiveItem, useChipLayout, useSuggestions } from "./hooks/index.js";
import type { QueryInputProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds query-input";

/**
 * The field a host places where people type text beside a set of structured
 * values: a leading search icon, a QueryChips group, the free-text entry, a
 * clear control and a list of suggestions. The free-text entry takes search
 * text and the first field of a clause; a chip's own **QueryChip.Entry**
 * takes the rest. Unlike **SearchInput**, which takes one piece of text, it
 * holds chips beside the text. Unlike **ComboboxInput**, whose chosen values
 * are tokens taken from one option set, its chips are clauses its host
 * builds. It knows nothing about queries: its host gives it the chips, the
 * text and the suggestions, and hears what is typed and chosen.
 *
 * `import { QueryInput } from "@canonical/dataviews-react";`
 *
 * @implements ds:global_dataviews.subcomponent.query_input
 */
export default function QueryInput({
  label,
  description,
  children,
  value,
  onValueChange,
  placeholder,
  options = [],
  onOptionSelect,
  onHighlightChange,
  loading = false,
  loadingLabel,
  emptyText,
  footer,
  disabled = false,
  onClear,
  clearHref,
  clearLabel,
  activeItem,
  onActiveItemChange,
  hiddenLabel,
  id,
  className,
  style,
  ref,
  ...props
}: QueryInputProps): ReactElement {
  // Chips are held when the chips' group holds any, which the server knows
  // as well as the client.
  const holdsChips = Children.toArray(children).some(
    (child) =>
      isValidElement<{ children?: ReactNode }>(child) &&
      Children.toArray(child.props.children).length > 0,
  );
  if (holdsChips && !hiddenLabel) {
    throw new Error("QueryInput: `hiddenLabel` is required with chips.");
  }
  const isMounted = useIsHydrated();
  const baseId = useId();
  const descriptionId = `${baseId}-description`;
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const entryRef = useRef<HTMLInputElement | null>(null);
  const attachEntry = useCallback((node: HTMLInputElement) => {
    entryRef.current = node;
    return undefined;
  }, []);
  const entryRefs = useMergedRef(ref, attachEntry);
  const roving = useActiveItem({
    activeItem,
    onActiveItemChange,
    contentRef,
    isMounted,
  });
  // A move of the stop that StopClaim claims is the host's own: it is not
  // reported back.
  const isClaimingRef = useRef(false);
  const setRovingItem = roving.setActiveItem;
  const handleRovingChange = useCallback(
    (itemId: string) => {
      if (!isClaimingRef.current) setRovingItem(itemId);
    },
    [setRovingItem],
  );
  const layout = useChipLayout({ contentRef });
  const suggestions = useSuggestions({
    options,
    onOptionSelect,
    onHighlightChange,
    value,
    loading,
    hasEmptyText: Boolean(emptyText),
    hasFooter: Boolean(footer),
    isMounted,
    disabled,
    baseId,
    rootRef,
  });
  const { hasFocus, getEntryProps } = suggestions;
  const isOverflowing = layout.hiddenCount > 0;

  // A press on the field outside the chips, the entry and the clear control,
  // such as on its padding, the search icon or the hidden count, goes to the
  // entry, which takes the stop.
  // @note Impure: moves focus to the entry.
  const handleFieldPress = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target as Element;
    const entry = entryRef.current;
    if (!entry || entry.disabled || target === entry) return;
    // Safari and macOS Firefox focus no button on a press, so focus would
    // drop to the page and the wrapped field collapse before the click
    // lands: the pressed control takes focus itself.
    const control = target.closest<HTMLElement>("button, a");
    if (control) {
      event.preventDefault();
      control.focus();
      return;
    }
    if (target.closest(".ds.query-chip")) {
      // A press on a chip's text, gaps or padding, which take no focus,
      // keeps focus where it is, as in a chip's open Entry.
      if (!target.closest("input")) event.preventDefault();
      return;
    }
    event.preventDefault();
    // Focus moving to the entry claims the stop; an entry that already has
    // focus, but not the stop, claims it here.
    const hadFocus = document.activeElement === entry;
    entry.focus();
    if (hadFocus && roving.activeItem !== ENTRY_ITEM_ID) {
      roving.setActiveItem(ENTRY_ITEM_ID);
    }
  };

  // The status region's text changes once as loading or the empty list
  // begins, so each is announced once.
  const readStatus = (): string | undefined => {
    if (!hasFocus) return undefined;
    if (loading) return loadingLabel;
    return options.length === 0 ? emptyText : undefined;
  };

  const toolbarProps = isMounted
    ? {
        role: "toolbar",
        "aria-label": label,
        "aria-describedby":
          description === undefined ? undefined : descriptionId,
      }
    : undefined;

  const renderClear = () => {
    if (clearLabel === undefined) return null;
    if (clearHref !== undefined && !disabled) {
      return (
        // Button's tertiary icon button, as the scripted route renders it.
        <a
          className="ds button tertiary clear"
          href={clearHref}
          aria-label={clearLabel}
          onClick={onClear}
        >
          <span className="icon">
            <Icon icon="close" />
          </span>
        </a>
      );
    }
    // Inert until scripts run: without an address, only a script clears.
    return (
      <Button
        type="button"
        className="clear"
        importance="tertiary"
        icon="close"
        aria-label={clearLabel}
        onClick={onClear}
        disabled={disabled || !isMounted}
      />
    );
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: focus moving within the field only measures its chips again
    <div
      ref={rootRef}
      id={id}
      style={style}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
      data-overflowing={isOverflowing || undefined}
      onFocus={(event) => {
        layout.measure();
        suggestions.closeOnFocusElsewhere(event);
      }}
      onBlur={layout.measure}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a press on the field's padding moves focus to its entry, which keyboard users reach with Tab */}
      <div className="field" onMouseDown={handleFieldPress}>
        <Icon icon="search" className="search-icon" />
        <RovingProvider
          activeItem={roving.activeItem}
          onActiveItemChange={handleRovingChange}
        >
          <StopClaim rootRef={rootRef} isClaimingRef={isClaimingRef} />
          <QueryEntryProvider
            getInputProps={(entryProps) => getEntryProps("chip", entryProps)}
          >
            <div ref={contentRef} className="content" {...toolbarProps}>
              {children}
              <Entry
                {...props}
                ref={entryRefs}
                isMounted={isMounted}
                getEntryProps={getEntryProps}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                aria-label={label}
                // The placeholder shows only while no chip is held.
                placeholder={holdsChips ? undefined : placeholder}
                disabled={disabled}
              />
            </div>
          </QueryEntryProvider>
        </RovingProvider>
        {hiddenLabel && isOverflowing && (
          <span className="hidden-count" aria-hidden="true">
            {hiddenLabel(layout.hiddenCount)}
          </span>
        )}
        {renderClear()}
      </div>
      {isMounted && description !== undefined && (
        <span id={descriptionId} hidden>
          {description}
        </span>
      )}
      {isMounted && (
        <Suggestions
          isOpen={suggestions.isOpen}
          anchorName={suggestions.anchorName}
          footerId={suggestions.footerId}
          getMenuProps={suggestions.getMenuProps}
          getItemProps={suggestions.getItemProps}
          label={label}
          options={options}
          loading={loading}
          emptyText={emptyText}
          footer={footer}
        />
      )}
      <span role="status" className="assistive">
        {readStatus()}
      </span>
    </div>
  );
}
