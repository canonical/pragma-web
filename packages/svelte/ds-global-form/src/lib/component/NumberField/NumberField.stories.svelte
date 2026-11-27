<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./NumberField.svelte";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome).
  const { Story } = defineMeta({
    title: "components/NumberField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "quantity", label: "Quantity" }} />

<Story
  name="With Range"
  args={{
    name: "quantity",
    label: "Quantity",
    description: "Between 0 and 10.",
    min: 0,
    max: 10,
    step: 1,
  }}
/>

<Story name="With Units" args={{ name: "price", label: "Price", prefix: "$", suffix: "USD" }} />
