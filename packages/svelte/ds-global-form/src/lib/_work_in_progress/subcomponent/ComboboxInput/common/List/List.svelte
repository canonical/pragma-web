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

  const isSelected = (item: (typeof items)[number]) => {
    const value = String(item[valueKey]);
    return Array.isArray(fieldValue)
      ? fieldValue.includes(value)
      : fieldValue === value;
  };
</script>

<ul popover="manual" class={[componentCssClassName, className]} {style} {...menu} {@attach togglePopover}>{#each items as item, index}<li {...getItem(index)} class={["p", highlightedIndex === index && "highlighted", isSelected(item) && "selected"]}>{convertItemToString(item)}</li>{/each}</ul>

<!-- @component
The popover listbox of a combobox. It spreads the builder's `menu` and
`getItem(index)` attributes, as React's spreads downshift's prop getters.
-->
