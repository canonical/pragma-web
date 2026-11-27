<script lang="ts">
  import { untrack } from "svelte";
  import readEditedChoices from "../../utils/readEditedChoices.js";
  import { Option } from "./common/index.js";
  import isChoiceChecked from "./isChoiceChecked.js";
  import toggleChoice from "./toggleChoice.js";
  import type { ChoicesProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds form-choices";

  let {
    id,
    class: className,
    style,
    name,
    isMultiple = false,
    disabled = false,
    layout = "inline",
    columns,
    options,
    value = $bindable(),
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  }: ChoicesProps = $props();

  // In the "columns" layout the column count drives a CSS grid; the variable
  // is left unset in the other layouts.
  const layoutStyle = $derived(
    layout === "columns" && columns
      ? [style, `--choices-columns:${columns}`].filter(Boolean).join(";")
      : style,
  );

  // Keeps a choice made before hydration: a pre-effect runs once, in the
  // browser, before the options write their checked state to the
  // server-rendered group, found by its `id` (the field always provides one).
  $effect.pre(() => {
    untrack(() => {
      const groupElement = id ? document.getElementById(id) : null;
      const edited = groupElement ? readEditedChoices(groupElement) : undefined;
      if (edited) value = isMultiple ? edited : edited.at(0);
    });
  });
</script>

<fieldset {id} aria-labelledby={ariaLabelledBy} aria-describedby={ariaDescribedBy} style={layoutStyle} class={[componentCssClassName, layout, className]}>{#each options as option (option.value)}<Option
      {name}
      type={isMultiple ? "checkbox" : "radio"}
      {option}
      disabled={disabled || Boolean(option.disabled)}
      bind:checked={
        () => isChoiceChecked(value, option.value, isMultiple),
        (checked) => (value = toggleChoice(value, option.value, Boolean(checked), isMultiple))
      }
    />{/each}</fieldset>

<!-- @component
Plain-label option group (radios or checkboxes). Bind `value` for two-way
binding: a string for radios, a string array with `isMultiple`.
-->
