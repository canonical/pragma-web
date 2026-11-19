import { Icon } from "@canonical/react-ds-global";
import { useCombobox, useMultipleSelection } from "downshift";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Option } from "../../../subcomponent/types.js";
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
 * Multiple-select combobox (presentational, controlled — no react-hook-form).
 * Selected values are rendered as removable chips. Uses downshift's
 * useMultipleSelection + useCombobox.
 *
 * With a `name`, one hidden input per selected value carries the selection, so
 * a native form post sends it without JavaScript. The visible text input stays
 * unnamed.
 *
 * @param {ComboboxInputProps} props - The component props
 * @returns {React.ReactElement} - Rendered MultipleCombobox component
 *
 * `import { MultipleCombobox } from "@canonical/react-ds-global-form";`
 */
const MultipleCombobox = ({
  id,
  className,
  style,
  name,
  options,
  value,
  onChange,
  disabled = false,
  placeholder,
  valueKey = VALUE_KEY,
  convertItemToString = defaultConvertItemToString,
  convertValueToItem = defaultConvertValueToItem,
  filterItems = defaultFilterItems,
  onInputValueChangeFactory,
}: ComboboxInputProps): React.ReactElement => {
  const values = value as string[] | undefined;

  // The lookup for the first value runs once, while rendering, so synchronous
  // answers are shown as chips in the server render. Promises are kept for the
  // mount effect to await instead of looking the values up twice. A rejected
  // lookup counts as not found.
  const [initialLookups] = useState(() =>
    (values ?? []).map((val) =>
      settleLookup(convertValueToItem(val, options, valueKey)),
    ),
  );
  const pendingInitialLookups = useRef(
    initialLookups.some(isPromise) ? initialLookups : null,
  );

  // State for selected items and filtered items
  const [selectedItems, setSelectedItems] = useState<Option[]>(() =>
    initialLookups.some(isPromise)
      ? []
      : (initialLookups as (Option | null)[]).filter(isOption),
  );
  const [items, setItems] = useState(options);
  // The chips on screen, read by the sync effect without re-running it.
  const selectedItemsRef = useRef(selectedItems);
  selectedItemsRef.current = selectedItems;
  // Whether chips are hidden while lookups are pending.
  const isPendingRef = useRef(false);
  // Values an asynchronous lookup could not resolve, so a re-run caused by a
  // new `options` or `convertValueToItem` does not fetch them again.
  const unresolvedRef = useRef(new Set<string>());
  const previousValuesRef = useRef(values);

  // Keep selectedItems in sync with the controlled value — on mount and on every
  // change. Must clear as well as populate: an empty/undefined `value` (e.g. after
  // reset) has to drive `selectedItems` back to [], otherwise a later re-render
  // that re-supplies the previous array would resurrect the cleared chips.
  // A value that already has a chip (the user just picked it) is not looked up
  // again. Latest wins: a value changed while its lookups are pending runs the
  // cleanup, which discards the stale answers. While they are pending no chip is
  // shown; the hidden inputs already carry the values.
  useEffect(() => {
    const previousValues = previousValuesRef.current;
    previousValuesRef.current = values;
    // Uncontrolled, the chips are the user's own: a new `options` must not
    // clear them.
    if (values === undefined && previousValues === undefined) {
      return;
    }
    const currentValues = values ?? [];
    const unresolved = unresolvedRef.current;
    for (const val of unresolved) {
      if (!currentValues.includes(val)) {
        unresolved.delete(val);
      }
    }
    const shown = new Map(
      selectedItemsRef.current.map((item) => [String(item[valueKey]), item]),
    );
    const lookups =
      pendingInitialLookups.current ??
      currentValues.map(
        (val) =>
          shown.get(val) ??
          (unresolved.has(val)
            ? null
            : settleLookup(convertValueToItem(val, options, valueKey))),
      );
    pendingInitialLookups.current = null;
    if (!lookups.some(isPromise)) {
      isPendingRef.current = false;
      setSelectedItems((lookups as (Option | null)[]).filter(isOption));
      return;
    }
    let isStale = false;
    isPendingRef.current = true;
    setSelectedItems([]);
    (async () => {
      const resolved = await Promise.all(lookups);
      if (!isStale) {
        resolved.forEach((item, index) => {
          if (!item && isPromise(lookups[index])) {
            unresolved.add(currentValues[index]);
          }
        });
        isPendingRef.current = false;
        setSelectedItems(resolved.filter(isOption));
      }
    })();
    return () => {
      isStale = true;
    };
  }, [values, convertValueToItem, options, valueKey]);

  // Downshift's useMultipleSelection hook for managing multiple selections
  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
  } = useMultipleSelection({
    selectedItems,
    onSelectedItemsChange: ({ selectedItems: newSelectedItems }) => {
      setSelectedItems(newSelectedItems);
      // Emit [] (never undefined) when the list empties: with a react-hook-form
      // Controller that has a defaultValue, onChange(undefined) reverts the field
      // to that default, resurrecting the removed chips. [] clears cleanly.
      const picked = newSelectedItems.map((item) => item[valueKey] as string);
      // While lookups are pending no chip is shown, so a pick adds to the
      // value instead of replacing the values still being looked up. Only a
      // controlled value can be pending.
      const newValue = isPendingRef.current
        ? [...new Set([...(values as string[]), ...picked])]
        : picked;
      onChange?.(newValue);
    },
  });

  // Default onInputValueChangeFactory: filters items locally
  const defaultOnInputValueChangeFactory = useCallback(
    () =>
      ({ inputValue }: { inputValue: string }) => {
        setItems(filterItems(options, inputValue));
      },
    [filterItems, options],
  );

  // Use provided onInputValueChangeFactory or default
  const onInputValueChange = onInputValueChangeFactory
    ? onInputValueChangeFactory(setItems)
    : defaultOnInputValueChangeFactory();

  // Downshift's useCombobox hook for combobox functionality
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    setInputValue, // Function to set input value
  } = useCombobox({
    items,
    // The selection lives in useMultipleSelection, not here. Pinning this to
    // null stops useCombobox remembering the last pick: otherwise picking that
    // option again (after removing its chip) is not a change and is ignored.
    selectedItem: null,
    onInputValueChange,
    onSelectedItemChange: ({ selectedItem }) => {
      if (
        selectedItem &&
        !selectedItems.some((item) => item[valueKey] === selectedItem[valueKey])
      ) {
        addSelectedItem(selectedItem);
        setInputValue(""); // Clear input after selection
      }
    },
    itemToString: convertItemToString,
  });

  // Reset function to clear selections and input. Emits [] (not undefined) so a
  // react-hook-form Controller with a defaultValue stores the cleared state
  // rather than falling back to its default and repopulating the chips.
  const resetSelection = useCallback(() => {
    setSelectedItems([]);
    setInputValue("");
    onChange?.([]);
  }, [onChange, setInputValue]);

  // Uncontrolled, the chips are the values to post.
  const postedValues = (
    values ?? selectedItems.map((item) => String(item[valueKey]))
  ).filter(Boolean);

  return (
    <div
      id={id}
      style={style}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      {/* Selected items displayed as chips */}
      <div className="selected-items">
        {selectedItems.map((selectedItem, index) => (
          <button
            key={String(selectedItem[valueKey])}
            {...getSelectedItemProps({ selectedItem, index })}
            onClick={() => removeSelectedItem(selectedItem)}
            className="chip"
          >
            {convertItemToString(selectedItem)}
            <Icon icon="close" className="remove-icon" />
          </button>
        ))}
      </div>

      {/* Input field with reset button in chrome wrapper */}
      <div className="ds input combobox-input chrome">
        <input
          className="p"
          {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
          placeholder={placeholder}
          disabled={disabled}
        />
        <ResetButton onClick={resetSelection} />
      </div>

      {/* Dropdown list of available options */}
      <List
        isOpen={isOpen}
        getMenuProps={getMenuProps}
        getItemProps={getItemProps}
        items={items}
        highlightedIndex={highlightedIndex}
        convertItemToString={convertItemToString}
        valueKey={valueKey}
        fieldValue={selectedItems.map((item) => String(item[valueKey]))}
      />

      {name
        ? postedValues.map((postedValue) => (
            <input
              key={postedValue}
              type="hidden"
              name={name}
              value={postedValue}
            />
          ))
        : null}
    </div>
  );
};

function isOption(item: Option | null): item is Option {
  return Boolean(item);
}

export default MultipleCombobox;
