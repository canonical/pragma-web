<script lang="ts">
  import { untrack } from "svelte";
  import type { Option } from "../../../subcomponent/types.js";
  import runLatest from "../../../utils/owner/runLatest.js";
  import { List, ResetButton } from "./common/index.js";
  import { VALUE_KEY } from "./constants.js";
  import createCombobox from "./createCombobox.svelte.js";
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

  let {
    id,
    class: className,
    style,
    name,
    options,
    value = $bindable(),
    inputValue = $bindable(""),
    disabled = false,
    placeholder,
    openOnReset = false,
    valueKey = VALUE_KEY,
    convertItemToString = defaultConvertItemToString,
    convertValueToItem = defaultConvertValueToItem,
    filterItems = defaultFilterItems,
    onblur,
  }: Omit<ComboboxInputProps, "isMultiple" | "value"> & {
    value?: string;
  } = $props();

  const uid = $props.id();

  // As in React, the list shows every option until the text first changes;
  // from then on it is filtered by the text, and follows `options` as the app
  // recomputes them.
  let isFiltered = $state(false);
  const items = $derived(
    isFiltered ? filterItems(options, inputValue) : options,
  );

  // The first value is looked up once, while rendering, so a synchronous
  // answer is selected in the server render. A promise is kept for the first
  // sync to await, instead of looking the value up twice. A rejected lookup
  // counts as not found.
  const initialLookup = untrack(() =>
    value === undefined
      ? null
      : settleLookup(convertValueToItem(value, options, valueKey)),
  );
  let pendingInitialLookup = isPromise(initialLookup) ? initialLookup : null;

  const combobox = createCombobox({
    id: `downshift-${uid}`,
    getItems: () => items,
    convertItemToString: (item) => convertItemToString(item),
    initialSelectedItem: isPromise(initialLookup) ? null : initialLookup,
    inputValue: {
      get: () => inputValue,
      set: (next) => {
        inputValue = next;
      },
    },
    onInputValueChange: () => {
      isFiltered = true;
    },
    onSelectedItemChange: (item) => {
      value = (item?.[valueKey] as string | undefined) || undefined;
    },
  });

  // Latest wins: a value changed while its lookup is pending discards the
  // stale answer. While a lookup is pending nothing is shown as selected; the
  // hidden input already carries the value.
  const lookups = runLatest((lookup: Promise<Option | null>) => lookup);

  /** Selects the item of a value set from outside, looking it up first. */
  const reflectValue = (current: string | undefined) => {
    const pending = pendingInitialLookup;
    pendingInitialLookup = null;
    lookups.cancel();
    if (current === combobox.selectedItem?.[valueKey]) return;
    const lookup =
      current === undefined
        ? null
        : (pending ??
          settleLookup(convertValueToItem(current, options, valueKey)));
    if (!isPromise(lookup)) {
      combobox.selectItem(lookup);
      return;
    }
    combobox.selectItem(null);
    lookups.run(lookup).then((outcome) => {
      if (outcome.status === "done") combobox.selectItem(outcome.value);
    });
  };

  $effect(() => {
    const current = value;
    untrack(() => reflectValue(current));
  });

  let inputElement: HTMLInputElement | undefined = $state();

  const resetAndFocusInput = () => {
    value = undefined;
    combobox.selectItem(null);
    (inputElement as HTMLInputElement).focus();
    if (openOnReset) combobox.openMenu();
  };

  const handleBlur = (event: FocusEvent) => {
    combobox.input.onblur(event);
    onblur?.(event);
  };
</script>

<div {id} {style} class={[componentCssClassName, className]}><div class="ds input combobox-input chrome"><input bind:this={inputElement} class="p" {...combobox.input} {disabled} {placeholder} onblur={handleBlur} /><ResetButton onclick={resetAndFocusInput} /></div><List
    menu={combobox.menu}
    getItem={(index) => combobox.getItem(index)}
    {items}
    highlightedIndex={combobox.highlightedIndex}
    fieldValue={value}
    {convertItemToString}
    {valueKey}
    isOpen={combobox.isOpen}
  />{#if name && value}<input type="hidden" {name} {value} />{/if}</div>

<!-- @component
Single-selection combobox, after React's `SingleCombobox`: a filterable text
input over a listbox, with downshift's IDs and ARIA. Bind `value` for the
selected value and `inputValue` for the typed text.

With a `name`, a hidden input carries the selected value, so a native form
post sends it without JavaScript. The visible text input stays unnamed, so the
value is posted once.
-->
