<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./CheckboxInput.svelte";

  // Presentational stories render the input directly, with no form decorator.
  const { Story } = defineMeta({
    title: "subcomponents/CheckboxInput",
    component: Component,
  });

  /** Sets the indeterminate DOM property on the checkbox. */
  const setIndeterminate = (element: HTMLInputElement) => {
    element.indeterminate = true;
  };
</script>

<Story name="Default" args={{ name: "subscribe" }} />

<Story name="Checked" args={{ name: "subscribe_checked", checked: true }} />

<!--
The indeterminate ("partially checked") state shows a minus glyph. It is a
DOM property, not an attribute, so it can only be set on the element via an
attachment — there is no `indeterminate` prop to pass.
-->
<Story name="Indeterminate" args={{ name: "subscribe_indeterminate" }}>
  {#snippet template(args)}
    <Component {...args} {@attach setIndeterminate} />
  {/snippet}
</Story>

<Story name="Disabled" args={{ name: "subscribe_disabled", disabled: true }} />

<Story
  name="Disabled Checked"
  args={{ name: "subscribe_disabled_checked", disabled: true, checked: true }}
/>

<!-- The indeterminate glyph in the disabled state. -->
<Story
  name="Disabled Indeterminate"
  args={{ name: "subscribe_disabled_indeterminate", disabled: true }}
>
  {#snippet template(args)}
    <Component {...args} {@attach setIndeterminate} />
  {/snippet}
</Story>
