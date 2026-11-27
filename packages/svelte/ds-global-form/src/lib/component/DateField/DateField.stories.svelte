<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./DateField.svelte";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome).
  const { Story } = defineMeta({
    title: "components/DateField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "birthday", label: "Birthday" }} />

<!-- Helper text via the `description` prop, rendered under the label. -->
<Story
  name="With Description"
  args={{
    name: "birthday_desc",
    label: "Birthday",
    description: "We use this to send you a discount on your birthday.",
  }}
/>

<Story
  name="With Min Max"
  args={{
    name: "appointment",
    label: "Appointment date",
    description: "Choose a date between 1 Jan 2024 and 31 Dec 2025.",
    min: "2024-01-01",
    max: "2025-12-31",
  }}
/>

<!-- A value outside the min/max range reports an inline error: `min`/`max`
constrain the native validity of the value, and the field shows the `error`
it is given. -->
<Story
  name="Out Of Range"
  args={{
    name: "appointment_oor",
    label: "Appointment date",
    min: "2024-01-01",
    max: "2025-12-31",
    value: "2030-06-15",
    error: "Date must be on or before 2025-12-31.",
  }}
/>

<Story name="Disabled" args={{ name: "date_disabled", label: "Date (disabled)", disabled: true }} />

<Story
  name="With Error"
  args={{ name: "date_error", label: "Date (required)", error: "Date is required" }}
/>
