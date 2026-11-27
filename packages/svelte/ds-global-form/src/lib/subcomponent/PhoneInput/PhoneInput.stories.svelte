<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./PhoneInput.svelte";

  // Presentational stories: the phone input holds its own value, no form.
  const { Story } = defineMeta({
    title: "subcomponents/PhoneInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ value: "", defaultCountry: "US" }} />

<Story
  name="Structured Value"
  args={{
    value: { countryCode: "US", number: "" },
    defaultCountry: "US",
    valueFormat: "structured",
  }}
/>

<Story
  name="Flag Display"
  args={{ value: "", defaultCountry: "US", countryDisplay: "flag" }}
/>

<Story
  name="Preferred Countries"
  args={{ value: "", defaultCountry: "GB", preferredCountries: ["GB", "FR"] }}
/>

<Story
  name="Name Display"
  args={{ value: "", defaultCountry: "US", countryDisplay: "name" }}
/>

<Story
  name="Filtered Countries"
  args={{
    value: "",
    defaultCountry: "FR",
    filteredCountries: ["FR", "DE", "ES", "IT"],
  }}
/>

<Story name="Masked" args={{ value: "", defaultCountry: "US", mask: true }} />
