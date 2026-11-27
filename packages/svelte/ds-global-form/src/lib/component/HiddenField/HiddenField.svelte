<script lang="ts">
  import useConditionalDisplay from "../../common/useConditionalDisplay.svelte.js";
  import { HiddenInput } from "../../subcomponent/HiddenInput/index.js";
  import type { HiddenFieldProps } from "./types.js";

  let {
    value = $bindable(),
    isOptional: _isOptional,
    error: _error,
    condition,
    ...rest
  }: HiddenFieldProps = $props();

  const uid = $props.id();
  const display = useConditionalDisplay(
    () => condition,
    () => () => (value = undefined),
  );
</script>

<!-- Only the id: a hidden input has no label, description or error to
     reference, so the field's ARIA wiring would point at nothing. -->{#if display.isVisible}<HiddenInput id={`${uid}-${rest.name}`} {...rest} bind:value />{/if}

<!-- @component
A hidden input with the field's ID, but no label, description, error or
accessibility wiring.

`import { HiddenField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.hidden_field
-->
