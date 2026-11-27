<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./RatingInput.svelte";

  const { Story } = defineMeta({
    title: "_work_in_progress/subcomponent/RatingInput",
    component: Component,
    args: { name: "rating", "aria-label": "Rate this article" },
  });

  let rating = $state(0);
</script>

<!-- Five stars — the default scale. -->
<Story name="Default" args={{ count: 5 }} />

<!-- Ten stars for finer-grained ratings. -->
<Story name="Ten Stars" args={{ count: 10 }} />

<!-- Half-star steps: each star splits into two, so 0.5, 1, 1.5 … are selectable. -->
<Story name="Half Stars" args={{ count: 5, allowHalf: true }} />

<!-- Pre-filled via `value`. -->
<Story name="With Initial Value" args={{ count: 5, value: 3 }} />

<Story name="Disabled" args={{ count: 5, value: 4, disabled: true }} />

<!-- Controlled: the parent owns the value and shows the current rating. -->
<Story name="Controlled" args={{ count: 5 }}>
  {#snippet template(args)}
    <div style="display: flex; align-items: center; gap: 1rem;">
      <Component {...args} bind:value={rating} />
      <span>{rating ? `${rating} / ${args.count ?? 5}` : "No rating"}</span>
    </div>
  {/snippet}
</Story>
