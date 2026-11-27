<script lang="ts">
  import type { LabelMessages, LabelProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds field-label";

  /** Placeholder for internationalized messages. */
  const defaultMessages: LabelMessages = {
    optional: () => "optional",
  };

  let {
    id,
    class: className,
    style,
    children,
    name,
    for: htmlFor,
    isOptional,
    requiredIndicator = "required",
    messages = defaultMessages,
    tag = "label",
  }: LabelProps = $props();

  // "required" mode marks the required fields, "optional" marks the optional
  // ones. The required marker is a CSS `::after` keyed off `data-required`, so
  // it stays out of the label's accessible name; the input carries
  // `aria-required` instead. The "(optional)" suffix is real text, since it is
  // informational and belongs in the accessible name.
  const markRequired = $derived(
    requiredIndicator === "required" && !isOptional,
  );
  const showOptionalSuffix = $derived(
    requiredIndicator === "optional" && isOptional,
  );
</script>

<svelte:element
  this={tag}
  {id}
  {style}
  for={tag === "label" ? htmlFor : undefined}
  data-required={markRequired || undefined}
  class={[componentCssClassName, className]}
>{#if children}{@render children()}{:else}{name}{/if}{#if showOptionalSuffix}<span class="optional">{` (${messages.optional()})`}</span>{/if}</svelte:element>

<!-- @component
The label of a form field. Marks required fields with a CSS marker, or
optional fields with an "(optional)" suffix, depending on `requiredIndicator`.

@implements ds:global.subcomponent.field-label
-->
