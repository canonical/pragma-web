<script lang="ts">
  import type { SegmentedControlItem, SegmentedControlProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds segmented-control";
  const componentId = $props.id();

  let {
    id,
    class: className,
    "aria-label": ariaLabel,
    items,
    value = $bindable(),
    onValueChange,
    ...rest
  }: SegmentedControlProps = $props();

  let rootRef = $state<HTMLDivElement>();

  const enabledIndexes = $derived(
    items.flatMap((item, index) => (item.disabled ? [] : [index])),
  );
  const selectedIndex = $derived.by(() => {
    const index = items.findIndex(
      (item) => !item.disabled && item.value === value,
    );
    return index >= 0 ? index : (enabledIndexes[0] ?? -1);
  });

  function getItemId(item: SegmentedControlItem, index: number): string {
    return item.id ?? `${id ?? componentId}-tab-${index}`;
  }

  function focusItem(index: number): void {
    rootRef
      ?.querySelector<HTMLButtonElement>(`[data-item-index="${index}"]`)
      ?.focus();
  }

  function selectItem(index: number, focus = false): void {
    const item = items[index];
    if (!item || item.disabled) return;

    const changed = item.value !== value;
    value = item.value;
    if (focus) focusItem(index);
    if (changed) onValueChange?.(item.value, item);
  }

  function getTargetIndex(key: string, index: number): number | undefined {
    if (key === "Home") return enabledIndexes[0];
    if (key === "End") return enabledIndexes.at(-1);
    if (key !== "ArrowLeft" && key !== "ArrowRight") return undefined;

    const currentPosition = enabledIndexes.indexOf(index);
    const isRtl = rootRef
      ? getComputedStyle(rootRef).direction === "rtl"
      : false;
    const direction = key === "ArrowLeft" ? -1 : 1;
    const nextPosition =
      (currentPosition +
        (isRtl ? -direction : direction) +
        enabledIndexes.length) %
      enabledIndexes.length;
    return enabledIndexes[nextPosition];
  }

  function handleKeydown(event: KeyboardEvent, index: number): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;

    const targetIndex = getTargetIndex(event.key, index);
    if (targetIndex === undefined) return;

    event.preventDefault();
    selectItem(targetIndex, true);
  }
</script>

<div
  bind:this={rootRef}
  {id}
  class={[componentCssClassName, className]}
  {...rest}
>
  <div class="list" role="tablist" aria-label={ariaLabel}>
    {#each items as item, index (item.value)}
      <button
        id={getItemId(item, index)}
        class="item"
        class:selected={index === selectedIndex}
        type="button"
        role="tab"
        aria-selected={index === selectedIndex}
        aria-controls={item.ariaControls}
        disabled={item.disabled}
        tabindex={index === selectedIndex ? 0 : -1}
        data-item-index={index}
        onclick={() => selectItem(index)}
        onkeydown={(event) => handleKeydown(event, index)}
      >
        {item.label}
      </button>
    {/each}
  </div>
</div>

<!-- @component
A compact group of mutually exclusive tabs used to switch between views of the
same content. Arrow keys, Home and End move focus and activate an enabled tab.
The consumer renders the panels and supplies their IDs through `ariaControls`.

`import { SegmentedControl } from "@canonical/svelte-ds-app-workplace";`

## Example Usage
```svelte
<script lang="ts">
  import { SegmentedControl } from "@canonical/svelte-ds-app-workplace";

  let value = $state("direct");
</script>

<SegmentedControl
  aria-label="Directory scope"
  items={[
    { label: "My direct reports", value: "direct" },
    { label: "My span of control", value: "span" },
  ]}
  bind:value
/>
```
-->

