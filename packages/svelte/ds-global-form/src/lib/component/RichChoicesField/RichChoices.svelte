<script lang="ts">
  import { untrack } from "svelte";
  import readEditedChoices from "../../utils/readEditedChoices.js";
  import isChoiceChecked from "../ChoicesField/isChoiceChecked.js";
  import toggleChoice from "../ChoicesField/toggleChoice.js";
  import { Option } from "./common/index.js";
  import type { RichChoicesProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds form-rich-choices";

  let {
    id,
    class: className,
    style,
    name,
    isMultiple = false,
    disabled = false,
    options,
    value = $bindable(),
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  }: RichChoicesProps = $props();

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

<fieldset {id} aria-labelledby={ariaLabelledBy} aria-describedby={ariaDescribedBy} {style} class={[componentCssClassName, className]}>{#each options as option (option.value)}<Option
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
Option group with hidden inputs and freely styled labels (cards, icons, …).
Bind `value` for two-way binding: a string for radios, a string array with
`isMultiple`.
-->
