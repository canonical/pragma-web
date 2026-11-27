<script lang="ts">
  import { untrack } from "svelte";
  import readEditedChoices from "../../../utils/readEditedChoices.js";
  import type { RatingInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds form-rating";

  const formatDefaultStarLabel = (rating: number, count: number) =>
    `${rating} of ${count} star${count === 1 ? "" : "s"}`;

  let {
    id,
    class: className,
    style,
    name,
    count = 5,
    allowHalf = false,
    value = $bindable(),
    disabled = false,
    formatStarLabel = formatDefaultStarLabel,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
  }: RatingInputProps = $props();

  const fallbackId = $props.id();
  const groupId = $derived(id ?? fallbackId);
  const stars = $derived(Array.from({ length: count }, (_, i) => i + 1));

  // Keeps a rating chosen before hydration: a pre-effect runs once, in the
  // browser, before the stars' `checked` properties are written to the
  // server-rendered group.
  $effect.pre(() => {
    untrack(() => {
      const groupElement = document.getElementById(groupId);
      const edited = groupElement
        ? readEditedChoices(groupElement)?.at(0)
        : undefined;
      if (edited) value = Number(edited);
    });
  });
</script>

<div
  id={groupId}
  {style}
  class={[componentCssClassName, allowHalf && "half", className]}
  role="radiogroup"
  aria-label={ariaLabelledby ? undefined : (ariaLabel ?? "Rating")}
  aria-labelledby={ariaLabelledby}
>{#each stars as star (star)}<span class="star"><!-- An outline star with a solid star clipped over it to the filled
           width, set by the checked radio through CSS. --><span class="star-glyph" aria-hidden="true"></span>{#each allowHalf ? [star - 0.5, star] : [star] as rating (rating)}{@const label = formatStarLabel(rating, count)}<!-- The label is the positioned click target and wraps its own
             visually hidden radio. --><label class={["star-target", rating % 1 !== 0 ? "left" : "right"]} title={label}><input
            id={`${groupId}-${rating}`}
            class="star-input"
            type="radio"
            {name}
            value={rating}
            {disabled}
            data-rating={rating}
            checked={value === rating}
            onchange={() => (value = rating)}
          
          /><span class="ds-visually-hidden">{label}</span
        ></label
      >{/each}</span
  >{/each}</div>

<!-- @component
Presentational star-rating input: a radio group of `count` stars, with
optional half ratings. Bind `value` for two-way binding.

`import { RatingInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.rating_input
-->
