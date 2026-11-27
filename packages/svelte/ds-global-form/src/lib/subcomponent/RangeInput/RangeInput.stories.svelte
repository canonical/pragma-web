<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./RangeInput.svelte";

  const { Story } = defineMeta({
    title: "subcomponents/RangeInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "volume", min: 0, max: 100, value: 50 }} />
