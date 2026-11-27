<script lang="ts">
  import { CheckboxInput } from "../../../../subcomponent/CheckboxInput/index.js";
  import { Label } from "../../../../subcomponent/Field/index.js";
  import { RadioInput } from "../../../../subcomponent/RadioInput/index.js";
  import type { OptionProps } from "./types.js";

  const componentCssClassName = "ds option";

  let {
    name,
    type,
    option,
    checked = $bindable(),
    disabled,
  }: OptionProps = $props();

  const uid = $props.id();
  const baseId = $derived(`${uid}-${name}`);
  const optionId = $derived(`${baseId}-${option.value}`);
  const inputProps = $derived({
    id: optionId,
    "aria-labelledby": `${optionId}-label`,
  });
</script>

<div class={[componentCssClassName, disabled && "disabled"]}>{#if type === "radio"}<RadioInput {name} value={option.value} {disabled} bind:checked {...inputProps} />{:else}<CheckboxInput {name} value={option.value} {disabled} bind:checked {...inputProps} />{/if}<!-- Option labels are plain choice text: required markers belong to the
       field chrome, so `isOptional` suppresses the marker. --><Label {name} isOptional class="p" id={`${optionId}-label`} for={optionId}>{option.label}</Label
></div>

<!-- @component
A single plain-label option within a `Choices` group: a styled native radio or
checkbox paired with its label. Bind `checked` for two-way binding.
-->
