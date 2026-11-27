<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../../storybook/decorators.js";
  import Component from "./RatingField.svelte";

  const { Story } = defineMeta({
    title: "_work_in_progress/component/RatingField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "rating", label: "Rate this article", count: 5 }} />

<Story name="Ten Stars" args={{ name: "rating", label: "Score out of ten", count: 10 }} />

<Story
  name="Half Stars"
  args={{
    name: "rating",
    label: "Rate this article",
    count: 5,
    allowHalf: true,
    description: "Click the left half of a star for a half rating",
  }}
/>

<Story name="Prefilled" args={{ name: "rating", label: "Rating", count: 5, value: 4 }} />
