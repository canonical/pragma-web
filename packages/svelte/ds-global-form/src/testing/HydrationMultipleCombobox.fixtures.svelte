<script lang="ts">
  import { Field } from "../lib/pattern/Field/index.js";
  import { Form } from "../lib/pattern/Form/index.js";

  const options = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ];
  let value = $state<string[]>(["apple", "banana"]);
</script>

<Form>
  <Field
    inputType="combobox"
    name="fruits"
    label="Fruits"
    isMultiple
    {options}
    bind:value
  />
  <output>{JSON.stringify(value)}</output>
</Form>
