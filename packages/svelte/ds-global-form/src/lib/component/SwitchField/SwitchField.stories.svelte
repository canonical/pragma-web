<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./SwitchField.svelte";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome).
  const { Story } = defineMeta({
    title: "components/SwitchField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "notifications", label: "Notifications" }} />

<Story name="Checked" args={{ name: "notifications_checked", label: "Checked", value: true }} />

<Story
  name="Disabled"
  args={{ name: "notifications_disabled", label: "Disabled", disabled: true }}
/>

<Story
  name="Disabled Checked"
  args={{
    name: "notifications_disabled_checked",
    label: "Disabled checked",
    disabled: true,
    value: true,
  }}
/>

<!-- With only `label`, it is used as the inline label beside the toggle — the
shape a uniform field map produces. No heading is rendered. -->
<Story
  name="Inline Label Only"
  args={{ name: "notifications_inline", label: "Enable email notifications" }}
/>

<!-- Providing both `label` and `controlLabel` renders the full toggle layout: the
`label` becomes a heading above, and `controlLabel` is the inline label
beside the toggle (which carries the `for` binding). -->
<Story
  name="With Heading"
  args={{
    name: "notifications_heading",
    label: "Notifications",
    controlLabel: "Email updates",
  }}
/>

<!-- Heading, the toggle with its inline label, then the description below. -->
<Story
  name="With Description"
  args={{
    name: "notifications_described",
    label: "Notifications",
    controlLabel: "Email updates",
    description: "Send me product updates and security alerts.",
  }}
/>

<!-- The control label is often a full sentence to click, not a short word. It
wraps as prose beside the toggle, which stays aligned to its first line. -->
<Story
  name="Sentence Label"
  args={{
    name: "terms",
    label:
      "I agree to the terms of service and acknowledge that my data will be processed in line with the privacy policy.",
  }}
/>
