<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./NumberInput.svelte";

  const { Story } = defineMeta({
    title: "subcomponents/NumberInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "quantity", value: 1 }} />

<Story
  name="With Range"
  args={{ name: "quantity", min: 0, max: 10, step: 1, value: 5 }}
/>

<Story
  name="With Units"
  args={{ name: "price", prefix: "$", suffix: "USD", value: 9.99 }}
/>

<Story name="Disabled" args={{ name: "quantity", value: 1, disabled: true }} />
