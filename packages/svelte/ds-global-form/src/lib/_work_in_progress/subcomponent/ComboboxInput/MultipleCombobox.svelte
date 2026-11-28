<script lang="ts">
  import { untrack } from "svelte";
  import type { Option } from "../../../subcomponent/types.js";
  import runLatest from "../../../utils/owner/runLatest.js";
  import { List, ResetButton } from "./common/index.js";
  import { VALUE_KEY } from "./constants.js";
  import createCombobox from "./createCombobox.svelte.js";
  import createMultipleSelection from "./createMultipleSelection.svelte.js";
  import messages from "./messages.js";
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
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-errormessage": ariaErrorMessage,
    "aria-invalid": ariaInvalid,
    "aria-required": ariaRequired,
  }: Omit<ComboboxInputProps, "isMultiple" | "value"> & {
    value?: string[];
  } = $props();

  const uid = $props.id();

  // As in the single combobox, the list shows every option until the text
  // first changes, then is filtered by the text and follows `options`.
  let isFiltered = $state(false);
  const items = $derived(
    isFiltered ? filterItems(options, inputValue) : options,
  );

  const isOption = (item: Option | null): item is Option => Boolean(item);

  // The first values are looked up once, while rendering, so synchronous
  // answers are chips in the server render. Promises are kept for the first
  // sync to await, instead of looking the values up twice. A rejected lookup
  // counts as not found.
  const initialLookups = untrack(() =>
    (value ?? []).map((current) =>
      settleLookup(convertValueToItem(current, options, valueKey)),
    ),
  );
  let pendingInitialLookups = initialLookups.some(isPromise)
    ? initialLookups
    : null;

  let selectedItems: Option[] = $state.raw(
    pendingInitialLookups
      ? []
      : (initialLookups as (Option | null)[]).filter(isOption),
  );
  // Whether chips are hidden while lookups are pending.
  let isPending = false;
  // Values an asynchronous lookup could not resolve, so a new `options` or
  // `convertValueToItem` does not fetch them again.
  const unresolved = new Set<string>();

  const selection = createMultipleSelection({
    getSelectedItems: () => selectedItems,
    onSelectedItemsChange: (next) => {
      selectedItems = next;
      const picked = next.map((item) => item[valueKey] as string);
      // While lookups are pending no chip is shown, so a pick adds to the
      // value instead of replacing the values still being looked up. Only a
      // value with entries can be pending.
      value = isPending
        ? [...new Set([...(value as string[]), ...picked])]
        : picked;
    },
    isKeyActionPrevented: () => combobox.isOpen,
  });

  const combobox = createCombobox({
    id: `downshift-${uid}`,
    getInputId: () => id,
    getLabelId: () => ariaLabelledBy ?? undefined,
    getAriaLabel: () => ariaLabel ?? undefined,
    getItems: () => items,
    convertItemToString: (item) => convertItemToString(item),
    // The selection lives in the chips. Pinning the combobox's own to `null`
    // makes picking an option again, after its chip is removed, a change.
    selectedItem: { get: () => null, set: () => {} },
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
      if (
        item &&
        !selectedItems.some((selected) => selected[valueKey] === item[valueKey])
      ) {
        selection.addSelectedItem(item);
        inputValue = "";
      }
    },
  });

  // Latest wins: values changed while their lookups are pending discard the
  // stale answers (the effect's cleanup cancels them).
  const lookups = runLatest((pending: Promise<(Option | null)[]>) => pending);

  /**
   * Shows the chips of values set from outside. A value that already has a
   * chip (the user just picked it) is not looked up again. While lookups are
   * pending no chip is shown; the hidden inputs already carry the values.
   */
  const reflectValues = (current: string[]) => {
    for (const unresolvedValue of unresolved)
      if (!current.includes(unresolvedValue))
        unresolved.delete(unresolvedValue);
    const shown = new Map(
      selectedItems.map((item) => [String(item[valueKey]), item]),
    );
    const answers =
      pendingInitialLookups ??
      current.map(
        (currentValue) =>
          shown.get(currentValue) ??
          (unresolved.has(currentValue)
            ? null
            : settleLookup(
                convertValueToItem(currentValue, options, valueKey),
              )),
      );
    pendingInitialLookups = null;
    if (!answers.some(isPromise)) {
      isPending = false;
      selectedItems = (answers as (Option | null)[]).filter(isOption);
      return;
    }
    isPending = true;
    selectedItems = [];
    lookups.run(Promise.all(answers)).then((outcome) => {
      if (outcome.status !== "done") return;
      outcome.value.forEach((item, index) => {
        if (!item && isPromise(answers[index])) unresolved.add(current[index]);
      });
      isPending = false;
      selectedItems = outcome.value.filter(isOption);
    });
  };

  $effect(() => {
    const current = value ?? [];
    // As React's, the chips follow a new `options`, lookup or `valueKey` too.
    void [options, convertValueToItem, valueKey];
    untrack(() => reflectValues(current));
    // Lookups still pending when the combobox goes away are discarded.
    return () => lookups.cancel();
  });

  // The values to post: every value, also those still being looked up.
  const postedValues = $derived((value ?? []).filter(Boolean));

  let inputElement: HTMLInputElement | undefined = $state();

  const resetSelection = () => {
    selectedItems = [];
    inputValue = "";
    // [] (never undefined), so an owner with a default value stores the
    // cleared selection instead of reverting to its default.
    value = [];
    (inputElement as HTMLInputElement).focus();
    if (openOnReset) combobox.openMenu();
  };

  /**
   * Removes a chip. One removed while it holds focus becomes the active chip
   * first, so focus moves to the chip that takes its place, or to the input
   * when none is left, instead of falling back to the page.
   */
  const removeChip = (event: MouseEvent, item: Option, index: number) => {
    if (event.currentTarget === document.activeElement) {
      if (selectedItems.length === 1)
        (inputElement as HTMLInputElement).focus();
      else selection.activeIndex = index;
    }
    selection.removeSelectedItem(item);
  };

  // The dropdown's handlers run before the combobox's, as downshift composes
  // `getDropdownProps` into `getInputProps`.
  const handleKeyDown = (event: KeyboardEvent) => {
    selection.dropdown.onkeydown?.(event);
    combobox.input.onkeydown(event);
  };

  const handleClick = () => {
    selection.dropdown.onclick?.();
    combobox.input.onclick();
  };

  const handleBlur = (event: FocusEvent) => {
    combobox.input.onblur(event);
    onblur?.(event);
  };
</script>

<div {style} class={[componentCssClassName, className]}><div class="selected-items">{#each selectedItems as item, index}<button type="button" {...selection.getSelectedItem(index)} aria-label={messages.remove(convertItemToString(item))} {disabled} onclick={(event) => removeChip(event, item, index)} class="chip">{convertItemToString(item)}<span class="remove-icon" aria-hidden="true">×</span></button>{/each}</div><div class="ds input combobox-input chrome"><input bind:this={inputElement} class="p" {...combobox.input} {...selection.dropdown} aria-describedby={ariaDescribedBy} aria-errormessage={ariaErrorMessage} aria-invalid={ariaInvalid} aria-required={ariaRequired} onkeydown={handleKeyDown} onclick={handleClick} {disabled} {placeholder} onblur={handleBlur} /><ResetButton {disabled} onclick={resetSelection} /></div><List
    menu={combobox.menu}
    getItem={(index) => combobox.getItem(index)}
    {items}
    highlightedIndex={combobox.highlightedIndex}
    fieldValue={selectedItems.map((item) => String(item[valueKey]))}
    {convertItemToString}
    {valueKey}
    isOpen={combobox.isOpen}
  />{#if name}{#each postedValues as postedValue}<input type="hidden" {name} value={postedValue} />{/each}{/if}</div>

<!-- @component
Multiple-selection combobox, after React's `MultipleCombobox`: the selected
options are chips before a filterable text input over a listbox, with
downshift's IDs and ARIA. Bind `value` for the selected values and
`inputValue` for the typed text. ArrowLeft moves from an empty input to the
chips, ArrowLeft and ArrowRight move between them, and Backspace or Delete
removes one; clicking a chip removes it. Removing the focused chip moves focus
to the chip that takes its place, or to the input when no chip is left. The
`id` and the ARIA props go to the text input; `aria-label` or
`aria-labelledby` names the list too.

With a `name`, one hidden input per selected value carries the selection, so a
native form post sends it without JavaScript. The visible text input stays
unnamed.
-->
