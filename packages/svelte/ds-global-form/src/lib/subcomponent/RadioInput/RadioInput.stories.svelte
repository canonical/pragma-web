<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./RadioInput.svelte";

  const { Story } = defineMeta({
    title: "subcomponents/RadioInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "choice", value: "a" }} />

<Story name="Checked" args={{ name: "choice", value: "a", checked: true }} />

<Story name="Disabled" args={{ name: "choice", value: "a", disabled: true }} />
