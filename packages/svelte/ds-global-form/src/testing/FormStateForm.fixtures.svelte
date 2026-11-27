<script lang="ts">
  import { Field, Form } from "../lib/pattern/index.js";
  import createFormState from "../lib/utils/owner/createFormState.svelte.js";

  // A Form whose owner is created inline, as the docs show. `novalidate` lets
  // the owner's messages replace the browser's own.
  let {
    onsubmit,
    onSubmit,
  }: {
    onsubmit: (event: SubmitEvent) => void;
    onSubmit: (values: { email?: string }) => void;
  } = $props();
</script>

<Form
  novalidate
  {onsubmit}
  owner={createFormState<{ email?: string }>({
    validate: (values) => ({
      email: values.email ? undefined : "Email is required",
    }),
    onSubmit: (values) => onSubmit(values),
  })}
>
  <Field inputType="email" name="email" label="Email" />
  <button type="submit">Send</button>
</Form>
