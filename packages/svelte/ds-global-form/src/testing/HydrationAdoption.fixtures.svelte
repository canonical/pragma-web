<script lang="ts">
  import { RatingInput } from "../lib/_work_in_progress/subcomponent/RatingInput/index.js";
  import { Field } from "../lib/pattern/Field/index.js";
  import { Form } from "../lib/pattern/Form/index.js";
  import { PhoneInput } from "../lib/subcomponent/PhoneInput/index.js";

  const options = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ];
  let values = $state<Record<string, unknown>>({
    text: "server",
    textarea: "server",
    number: 1,
    date: "2026-01-01",
    checkbox: false,
    switch: true,
    select: "a",
    multiple: ["a"],
    radio: "a",
    checks: ["a"],
    rich: "a",
    richMany: [] as string[],
    phone: "+15551234",
    rating: 2,
  });
</script>

<Form>
  <Field inputType="text" name="text" label="Text" bind:value={values.text as string} />
  <Field inputType="textarea" name="textarea" label="Textarea" bind:value={values.textarea as string} />
  <Field inputType="number" name="number" label="Number" bind:value={values.number as number} />
  <Field inputType="date" name="date" label="Date" bind:value={values.date as string} />
  <Field inputType="checkbox" name="checkbox" label="Checkbox" bind:value={values.checkbox as boolean} />
  <Field inputType="switch" name="switch" label="Switch" bind:value={values.switch as boolean} />
  <Field inputType="select" name="select" label="Select" {options} bind:value={values.select as string} />
  <Field inputType="select" name="multiple" label="Multiple" multiple {options} bind:value={values.multiple as string[]} />
  <Field inputType="choices" name="radio" label="Radio" {options} bind:value={values.radio as string} />
  <Field inputType="choices" name="checks" label="Checks" isMultiple {options} bind:value={values.checks as string[]} />
  <Field inputType="rich-choices" name="rich" label="Rich" {options} bind:value={values.rich as string} />
  <Field inputType="rich-choices" name="richMany" label="Rich many" isMultiple {options} bind:value={values.richMany as string[]} />
  <PhoneInput id="phone-root" name="phone" filteredCountries={["US", "GB"]} bind:value={values.phone as string} />
  <RatingInput name="rating" aria-label="Rating" bind:value={values.rating as number} />
  <output>{JSON.stringify(values)}</output>
</Form>
