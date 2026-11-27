<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./SwitchInput.svelte";

  // Presentational stories render the input directly, with no form decorator.
  const { Story } = defineMeta({
    title: "subcomponents/SwitchInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "notifications" }} />

<Story name="Checked" args={{ name: "notifications_checked", checked: true }} />

<Story name="Disabled" args={{ name: "notifications_disabled", disabled: true }} />

<Story
  name="Disabled Checked"
  args={{ name: "notifications_disabled_checked", disabled: true, checked: true }}
/>
