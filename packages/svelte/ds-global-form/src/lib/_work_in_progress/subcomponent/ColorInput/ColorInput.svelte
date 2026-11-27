<script lang="ts">
  import { untrack } from "svelte";
  import {
    DEFAULT_HEX_FORMATS,
    DEFAULT_SWATCHES,
    HEX_MAX_LENGTHS,
    HEX_PATTERNS,
  } from "./constants.js";
  import type { ColorInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input color";

  let {
    id,
    class: className,
    style,
    value = $bindable(),
    swatches = DEFAULT_SWATCHES,
    showHexInput = true,
    showCurrentColor = true,
    hexFormats = DEFAULT_HEX_FORMATS,
    disabled = false,
    ...rest
  }: ColorInputProps = $props();

  let popoverRef: HTMLDivElement | undefined = $state();
  let isOpen = $state(false);
  const currentColor = $derived(typeof value === "string" ? value : "#000000");
  let hexText = $state(untrack(() => currentColor.replace("#", "")));
  const hasSwatches = $derived(swatches.length > 0);
  const maxLength = $derived(
    Math.max(...hexFormats.map((format) => HEX_MAX_LENGTHS[format])),
  );

  // Shows or hides the swatch popover whenever `isOpen` changes; the popover
  // API is imperative, so it cannot be driven from markup.
  $effect(() => {
    if (!popoverRef) return;
    try {
      if (isOpen) popoverRef.showPopover();
      else popoverRef.hidePopover();
    } catch {
      // The popover API is unavailable or already in the target state.
    }
  });

  // Closes the open popover on a click outside it. Registered on the next
  // frame, so the click that opened it does not close it.
  $effect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent) => {
      if (!popoverRef?.contains(event.target as Node)) isOpen = false;
    };
    const frame = requestAnimationFrame(() =>
      document.addEventListener("click", close),
    );
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", close);
    };
  });

  function selectSwatch(color: string) {
    value = color;
    hexText = color.replace("#", "");
    isOpen = false;
  }

  function editHex(event: Event & { currentTarget: HTMLInputElement }) {
    hexText = event.currentTarget.value;
    const candidate = `#${hexText}`;
    if (hexFormats.some((format) => HEX_PATTERNS[format].test(candidate)))
      value = candidate;
  }
</script>

{#snippet hexInputRow()}{#if showHexInput}<div class={["hex-input-row", !hasSwatches && "no-separator"]}>{#if showCurrentColor}<span class="color-preview" style:background-color={currentColor} aria-hidden="true"></span>{/if}<span class="hex-prefix" aria-hidden="true">#</span><input
        type="text"
        class="hex-input"
        value={hexText}
        oninput={editHex}
        maxlength={maxLength}
        placeholder="000000"
        {disabled}
        aria-label="Hex color value"
      /></div>{/if}{/snippet}{#if hasSwatches}<div {id} {style} class={[componentCssClassName, className]}><button
      type="button"
      class="color-trigger chrome"
      onclick={() => (isOpen = !isOpen)}
      {disabled}
      {...rest}
    >{#if showCurrentColor}<span class="color-preview" style:background-color={currentColor} aria-hidden="true"></span>{/if}<span class="color-value">{currentColor}</span></button><div bind:this={popoverRef} popover="manual" class="color-popover"><div class="swatch-grid" role="listbox" aria-label="Color swatches">{#each swatches as color (color)}{@const selected = color.toLowerCase() === currentColor.toLowerCase()}<button
            type="button"
            role="option"
            class={["swatch", selected && "selected"]}
            style:background-color={color}
            onclick={() => selectSwatch(color)}
            aria-selected={selected}
            aria-label={color}
            {disabled}
          ></button>{/each}</div>{@render hexInputRow()}</div></div>{:else}<!-- Without swatches the hex input sits inline in the chrome. --><div {id} {style} class={[componentCssClassName, "inline", className]} {...rest}>{@render hexInputRow()}</div>{/if}

<!-- @component
Presentational colour input with a swatch popover and a hex text input. Bind
`value` for two-way binding.

`import { ColorInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.color_input
-->
