<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./CheckboxField.svelte";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome).
  // `indeterminate` is a DOM property, not an attribute; Svelte sets it as a
  // property on the rendered input, so the stories pass it as a prop.
  const { Story } = defineMeta({
    title: "components/CheckboxField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "subscribe", label: "Subscribe" }} />

<Story name="Checked" args={{ name: "subscribe_checked", label: "Checked", value: true }} />

<Story
  name="Indeterminate"
  args={{ name: "subscribe_indeterminate", label: "Indeterminate", indeterminate: true }}
/>

<Story name="Disabled" args={{ name: "subscribe_disabled", label: "Disabled", disabled: true }} />

<Story
  name="Disabled Checked"
  args={{
    name: "subscribe_disabled_checked",
    label: "Disabled checked",
    disabled: true,
    value: true,
  }}
/>

<Story
  name="Disabled Indeterminate"
  args={{
    name: "subscribe_disabled_indeterminate",
    label: "Disabled indeterminate",
    disabled: true,
    indeterminate: true,
  }}
/>
