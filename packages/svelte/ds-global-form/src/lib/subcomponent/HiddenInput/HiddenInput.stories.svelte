<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./HiddenInput.svelte";

  const { Story } = defineMeta({
    title: "subcomponents/HiddenInput",
    component: Component,
    parameters: { chromatic: { disableSnapshot: true } },
  });
</script>

<Story
  name="Default"
  args={{ name: "hidden_field", value: "hidden_value", readonly: true }}
/>
