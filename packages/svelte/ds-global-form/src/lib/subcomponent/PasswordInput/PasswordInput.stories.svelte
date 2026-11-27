<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./PasswordInput.svelte";

  const { Story } = defineMeta({
    title: "subcomponents/PasswordInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "password", value: "hunter2" }} />

<Story
  name="Not Revealable"
  args={{ name: "password", value: "hunter2", revealable: false }}
/>

<Story
  name="Disabled"
  args={{ name: "password", value: "hunter2", disabled: true }}
/>
