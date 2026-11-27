<script lang="ts">
  import { Field } from "../lib/pattern/Field/index.js";
  import { Form } from "../lib/pattern/Form/index.js";

  const options = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
  ];
  let value = $state<string | undefined>("banana");
</script>

<Form>
  <Field inputType="combobox" name="fruit" label="Fruit" {options} bind:value />
  <output>{JSON.stringify(value ?? null)}</output>
</Form>
