<script lang="ts">
  import convertItemToString from "../../utils/convertItemToString.js";
  import type { ListProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds combobox-list";

  let {
    id,
    class: className,
    style,
    items,
    highlightedIndex,
    fieldValue,
    isOpen,
    onselect,
  }: ListProps = $props();

  let listRef: HTMLUListElement | undefined = $state();

  // Shows or hides the list popover whenever `isOpen` changes; the popover
  // API is imperative, so it cannot be driven from markup.
  $effect(() => {
    // `listRef` is bound before effects run.
    const list = listRef as HTMLUListElement;
    try {
      if (isOpen) list.showPopover();
      else list.hidePopover();
    } catch {
      // The popover API is unavailable or already in the target state.
    }
  });

  const isSelected = (value: string) =>
    Array.isArray(fieldValue)
      ? fieldValue.includes(value)
      : fieldValue === value;
</script>

<ul bind:this={listRef} {id} popover="manual" class={[componentCssClassName, className]} {style} role="listbox">{#each items as item, index (item.value)}<li
      id={id ? `${id}-${index}` : undefined}
      role="option"
      aria-selected={isSelected(item.value)}
      class={["p", highlightedIndex === index && "highlighted", isSelected(item.value) && "selected"]}
      onclick={() => onselect?.(item)}
      onkeydown={() => {}}
    >{convertItemToString(item)}</li
  >{/each}</ul>

<!-- @component
The popover listbox of a combobox.
-->
