<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./ResetButton.svelte";

  const { Story } = defineMeta({
    title: "_work_in_progress/subcomponent/ComboboxInput/ResetButton",
    component: Component,
  });
</script>

<Story name="Default" args={{ onclick: () => {} }} />
