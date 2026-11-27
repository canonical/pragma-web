<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./PhoneField.svelte";

  // Field-tier stories: the phone input bound to its `value`, inside a form.
  const { Story } = defineMeta({
    title: "components/PhoneField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<!-- The label names the number input; the country select keeps its own
"Country code" label. In a plain HTML submission the number posts as `phone`
and the selected country code as `phone-country`. -->
<Story name="Default" args={{ name: "phone", label: "Phone number" }} />

<Story
  name="With Default Country"
  args={{ name: "phone_uk", label: "Phone (UK default)", defaultCountry: "GB" }}
/>

<Story
  name="With Preferred Countries"
  args={{
    name: "phone_preferred",
    label: "Phone (preferred countries)",
    preferredCountries: ["US", "GB", "CA"],
  }}
/>

<Story
  name="Structured Value"
  args={{
    name: "phone_structured",
    label: "Phone (structured value)",
    valueFormat: "structured",
  }}
/>

<Story
  name="Flag Display"
  args={{ name: "phone_flag", label: "Phone (flag display)", countryDisplay: "flag" }}
/>

<!-- Opt into live display masking with `mask`: the national number is formatted
with the selected country's mask as you type (here US `(###) ###-####`). The
mask is cosmetic only — the submitted value is always raw digits, regardless
of `mask`. -->
<Story
  name="Masked"
  args={{ name: "phone_masked", label: "Phone (masked)", defaultCountry: "US", mask: true }}
/>

<Story name="Disabled" args={{ name: "phone_disabled", label: "Phone (disabled)", disabled: true }} />
