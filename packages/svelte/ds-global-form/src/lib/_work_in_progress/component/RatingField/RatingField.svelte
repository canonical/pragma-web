<script lang="ts">
  import splitChromeProps from "../../../common/splitChromeProps.js";
  import Wrapper from "../../../common/Wrapper/Wrapper.svelte";
  import { RatingInput } from "../../subcomponent/RatingInput/index.js";
  import type { RatingFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: RatingFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<RatingInput
      aria-labelledby={controlProps["aria-labelledby"]}
      {...control}
      id={controlProps.id}
      name={chrome.name}
      bind:value
    />{/snippet}</Wrapper>

<!-- @component
RatingInput wrapped with field chrome. Bind `value` for two-way binding.

`import { RatingField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.rating_field
-->
