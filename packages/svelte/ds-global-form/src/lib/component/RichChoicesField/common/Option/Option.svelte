<script lang="ts">
  import Adornment from "../../../../common/Adornment/Adornment.svelte";
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

<div class={[componentCssClassName, disabled && "disabled"]}><input
    {name}
    value={option.value}
    {disabled}
    {type}
    {checked}
    onchange={(event) => (checked = event.currentTarget.checked)}
    {...inputProps}
  /><label class="p" id={`${optionId}-label`} for={optionId}><Adornment content={option.label} /></label
></div>

<!-- @component
A single option within a `RichChoices` group: a hidden native input paired with
a freely styled label. Bind `checked` for two-way binding.
-->
