<script lang="ts">
  import type { ListProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds combobox-list";

  let {
    class: className,
    style,
    items,
    menu,
    getItem,
    highlightedIndex,
    convertItemToString,
    fieldValue,
    valueKey,
    isOpen,
  }: ListProps = $props();

  /**
   * Shows or hides the list popover as `isOpen` changes; the popover API is
   * imperative, so markup cannot drive it.
   */
  const togglePopover = (list: HTMLElement) => {
    try {
      if (isOpen) list.showPopover();
      else list.hidePopover();
    } catch {
      // The popover API is unavailable or already in the target state.
    }
  };

  // In multiple mode the options are a multi-selectable listbox: each one's
  // `aria-selected` says whether it is chosen, as the WAI-ARIA listbox pattern
  // asks, and `aria-activedescendant` alone points at the highlight. A single
  // combobox keeps downshift's `aria-selected`, which follows the highlight.
  const isMultiple = $derived(Array.isArray(fieldValue));

  const isSelected = (item: (typeof items)[number]) => {
    const value = String(item[valueKey]);
    return Array.isArray(fieldValue)
      ? fieldValue.includes(value)
      : fieldValue === value;
  };
</script>

<!-- The role, listbox, comes from the builder's `menu`. -->
<!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
<ul popover="manual" class={[componentCssClassName, className]} {style} {...menu} aria-multiselectable={isMultiple || undefined} {@attach togglePopover}>{#each items as item, index}<li {...getItem(index)} {...isMultiple && { "aria-selected": isSelected(item) }} class={["p", highlightedIndex === index && "highlighted", isSelected(item) && "selected"]}>{convertItemToString(item)}</li>{/each}</ul>

<!-- @component
The popover listbox of a combobox. It spreads the builder's `menu` and
`getItem(index)` attributes, as React's spreads downshift's prop getters.
-->
