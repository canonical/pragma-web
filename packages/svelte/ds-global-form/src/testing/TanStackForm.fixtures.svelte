<script lang="ts">
  import { createForm } from "@tanstack/svelte-form";
  import { untrack } from "svelte";
  import { Field, Form } from "../lib/pattern/index.js";
  import createBinding from "../lib/utils/owner/createBinding.js";

  // A TanStack Form instance, adapted into a form owner with `createBinding`.
  // `direct` prints a value read straight from the TanStack adapter, to show
  // whether its state is reactive under runes on its own.
  type Values = { email: string; newsletter: boolean; topic: string };
  let {
    expose = () => {},
  }: { expose?: (form: ReturnType<typeof createTanStackForm>) => void } =
    $props();

  function createTanStackForm() {
    return createForm(() => ({
      defaultValues: {
        email: "ada@example.com",
        newsletter: false,
        topic: "",
      } as Values,
      validators: {
        onChange: ({ value }: { value: Values }) =>
          value.email.includes("@")
            ? undefined
            : { fields: { email: "Enter a valid email address" } },
      },
    }));
  }

  const form = createTanStackForm();
  untrack(() => expose(form));

  // Read straight from TanStack: a derived recomputes only when a reactive
  // source it read changes.
  const direct = $derived(form.state.values.email);

  const owner = createBinding<Values>({
    getValues: () => form.state.values,
    setValue: (name, value) => form.setFieldValue(name, value as never),
    subscribe: (notify) => form.store.subscribe(notify).unsubscribe,
    getError: (name) => {
      const errors = form.getFieldMeta(name)?.errors;
      return errors?.length ? String(errors.at(0)) : undefined;
    },
    blur: (name) =>
      form.setFieldMeta(name, (meta) => ({ ...meta, isBlurred: true })),
  });
</script>

<Form {owner} onsubmit={(event) => event.preventDefault()}>
  <Field inputType="email" name="email" label="Email" />
  <Field inputType="checkbox" name="newsletter" label="Newsletter" />
  <Field
    inputType="text"
    name="topic"
    label="Topic"
    isOptional
    condition={(values) => values.newsletter === true}
  />
</Form>
<output data-testid="direct">{direct}</output>
<output data-testid="owned">{owner.values.email}</output>
