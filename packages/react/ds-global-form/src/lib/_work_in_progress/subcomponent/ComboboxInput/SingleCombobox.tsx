/* @canonical/generator-ds 0.9.0-experimental.9 */
import { type UseComboboxStateChange, useCombobox } from "downshift";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { Option } from "../../../subcomponent/types.js";
import mergeRefs from "../../../utils/mergeRefs.js";
import { List, ResetButton } from "./common/index.js";
import { VALUE_KEY } from "./constants.js";
import type { ComboboxInputProps } from "./types.js";
import {
  convertItemToString as defaultConvertItemToString,
  convertValueToItem as defaultConvertValueToItem,
  filterItems as defaultFilterItems,
  isPromise,
  settleLookup,
} from "./utils/index.js";
import "./styles.css";

const componentCssClassName = "ds form-combobox";

/**
 * Single-select combobox (presentational, controlled — no react-hook-form).
 *
 * Disambiguation:
 * - `Option` is this library's option type, common to Select/Choices/Combobox.
 * - `Item` is the downshift-cast form of an Option.
 *
 * The forwarded ref (the field's ref when bound) is merged with the internal
 * input ref so focus management still works.
 *
 * With a `name`, a hidden input carries the selected value, so a native form
 * post sends it without JavaScript. The visible text input stays unnamed, so
 * the value is posted once.
 */
export const SingleCombobox = forwardRef<HTMLInputElement, ComboboxInputProps>(
  function SingleCombobox(
    {
      id,
      className,
      style,
      name,
      options,
      value,
      onChange,
      onBlur,
      disabled = false,
      openOnReset = false,
      onInputValueChangeFactory,
      placeholder,
      valueKey = VALUE_KEY,
      convertItemToString = defaultConvertItemToString,
      convertValueToItem = defaultConvertValueToItem,
      filterItems = defaultFilterItems,
    },
    fieldRef,
  ) {
    const [items, setItems] = useState(options);
    const currentValue = value as string | undefined;

    // The lookup for the first value runs once, while rendering, so a
    // synchronous answer is selected in the server render. A promise is kept
    // for the mount effect to await instead of looking the value up twice.
    // A rejected lookup counts as not found.
    const [initialLookup] = useState(() =>
      currentValue === undefined
        ? null
        : settleLookup(convertValueToItem(currentValue, options, valueKey)),
    );
    const pendingInitialLookup = useRef(
      isPromise(initialLookup) ? initialLookup : null,
    );

    const handleSelectedItemChange = useCallback(
      (changes: UseComboboxStateChange<Option>) => {
        // `selectItem` only reflects the controlled value (or a reset, which
        // emits its own change), so it must not echo back as a change.
        if (changes.type === useCombobox.stateChangeTypes.FunctionSelectItem) {
          return;
        }
        onChange?.(
          (changes.selectedItem?.[valueKey] as string | undefined) || undefined,
        );
      },
      [onChange, valueKey],
    );

    /* This allows for the option logic to be controlled externally, for instance by a backend
     * For simpler use cases, simply pass a custom filterItems function */
    const defaultOnInputValueChangeFactory =
      (stateUpdater: React.Dispatch<React.SetStateAction<Option[]>>) =>
      ({ inputValue }: { inputValue: string }) =>
        stateUpdater(filterItems(options, inputValue));

    const onInputValueChange = onInputValueChangeFactory
      ? onInputValueChangeFactory(setItems)
      : defaultOnInputValueChangeFactory(setItems);

    const {
      isOpen,
      openMenu,
      selectItem,
      selectedItem,
      getMenuProps,
      getInputProps,
      highlightedIndex,
      getItemProps,
    } = useCombobox({
      items,
      onSelectedItemChange: handleSelectedItemChange,
      onInputValueChange,
      initialSelectedItem: isPromise(initialLookup) ? null : initialLookup,
      itemToString: convertItemToString,
    });

    const inputRef = useRef<HTMLInputElement>(null); // Own ref to manage focus

    // Latest wins: a value changed while its lookup is pending runs the
    // cleanup, which discards the stale answer. While a lookup is pending
    // nothing is shown as selected; the hidden input already carries the value.
    // biome-ignore lint/correctness/useExhaustiveDependencies: run the effect only when the field value changes
    useEffect(() => {
      const pendingLookup = pendingInitialLookup.current;
      pendingInitialLookup.current = null;
      if (currentValue === selectedItem?.[valueKey]) {
        return;
      }
      const lookup =
        currentValue === undefined
          ? null
          : (pendingLookup ??
            settleLookup(convertValueToItem(currentValue, options, valueKey)));
      if (!isPromise(lookup)) {
        selectItem(lookup);
        return;
      }
      let isStale = false;
      selectItem(null);
      (async () => {
        const newItem = await lookup;
        if (!isStale) {
          selectItem(newItem);
        }
      })();
      return () => {
        isStale = true;
      };
    }, [currentValue]);

    const resetAndFocusInput = useCallback(() => {
      onChange?.(undefined); // Consistent with handleSelectedItemChange
      selectItem(null);
      inputRef.current?.focus();
      if (openOnReset) {
        openMenu();
      }
    }, [selectItem, openOnReset, openMenu, onChange]);

    const combinedRef = mergeRefs(inputRef, fieldRef ?? undefined);

    // Uncontrolled, the selection is the value to post.
    const postedValue =
      value === undefined
        ? (selectedItem?.[valueKey] as string | undefined)
        : currentValue;

    return (
      <div
        id={id}
        style={style}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
      >
        <div className="ds input combobox-input chrome">
          <input
            className="p"
            {...getInputProps({
              disabled,
              placeholder,
              onBlur,
              ref: combinedRef,
            })}
          />
          <ResetButton onClick={resetAndFocusInput} />
        </div>
        <List
          isOpen={isOpen}
          getMenuProps={getMenuProps}
          getItemProps={getItemProps}
          items={items}
          highlightedIndex={highlightedIndex}
          fieldValue={currentValue}
          convertItemToString={convertItemToString}
          valueKey={valueKey}
        />
        {name && postedValue ? (
          <input type="hidden" name={name} value={postedValue} />
        ) : null}
      </div>
    );
  },
);

export default SingleCombobox;
