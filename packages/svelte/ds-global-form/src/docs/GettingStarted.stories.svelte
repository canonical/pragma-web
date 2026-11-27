<script lang="ts" module>
  import { Button } from "@canonical/svelte-ds-global";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { Field } from "../lib/pattern/Field/index.js";
  import { Form } from "../lib/pattern/Form/index.js";
  import createFormState from "../lib/utils/owner/createFormState.svelte.js";
  import SubmittedValues from "../storybook/SubmittedValues.svelte";

  const { Story } = defineMeta({
    title: "Documentation/Getting Started/Examples",
    // `grid: "responsive"` (from @canonical/storybook-addon-utils) renders each
    // example inside a `.grid.responsive` so the form's subgrid resolves its
    // columns — and the grid mode stays switchable from the toolbar.
    parameters: { layout: "padded", grid: "responsive" },
  });

  /** Logs the posted entries instead of leaving the page. */
  const logEntries = (event: SubmitEvent) => {
    event.preventDefault();
    console.log(
      Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement)),
    );
  };

  type Values = Record<string, unknown>;
  const requireEmail = (values: Readonly<Values>) => ({
    email: values.email ? undefined : "Email is required",
  });

  // Internal mode: the owner is created inline in `Form` — pass `onSubmit`,
  // and optionally `defaultValues` and a validation mode. Simplest for a
  // self-contained form.
  let internalSubmitted = $state<Values | null>(null);

  // External mode: you keep the owner, so you can read `isSubmitting` and call
  // `reset` — useful for async submits, shared/multi-step state, or a "reset"
  // button.
  let externalSubmitted = $state<Values | null>(null);
  const external = createFormState<Values>({
    mode: "onBlur",
    defaultValues: { name: "", email: "" },
    validate: requireEmail,
    onSubmit: async (values) => {
      // Simulate an async request so `isSubmitting` is observable.
      await new Promise((resolve) => setTimeout(resolve, 800));
      externalSubmitted = values;
      external.reset(); // clear back to defaultValues after a successful submit
    },
  });

  const validation = createFormState<Values>({
    mode: "onBlur",
    validate: (values) => ({
      email: !values.email
        ? "Email is required"
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email))
          ? undefined
          : "Enter a valid email address",
      age: !values.age
        ? "Age is required"
        : Number(values.age) < 18
          ? "Must be at least 18"
          : undefined,
    }),
    onSubmit: (values) => console.log(values),
  });

  const conditional = createFormState({
    onSubmit: (values) => console.log(values),
  });
</script>

<Story name="Basic form" exportName="BasicForm">
  {#snippet template()}
    <Form onsubmit={logEntries}>
      <Field name="name" inputType="text" label="Full name" />
      <Field name="email" inputType="text" label="Email address" />
      <Field
        name="message"
        inputType="textarea"
        label="Message"
        description="Maximum 500 characters"
      />
      <Button type="submit">Send</Button>
    </Form>
  {/snippet}
</Story>

<Story name="Form — internal mode" exportName="InternalMode">
  {#snippet template()}
    <Form
      owner={createFormState<Values>({
        mode: "onBlur",
        defaultValues: { name: "Ada", email: "" },
        validate: requireEmail,
        onSubmit: (values) => {
          internalSubmitted = values;
        },
      })}
    >
      <Field name="name" inputType="text" label="Full name" />
      <Field name="email" inputType="text" label="Email address" />
      <Button type="submit">Send</Button>
    </Form>
    <SubmittedValues data={internalSubmitted} />
  {/snippet}
</Story>

<Story name="Form — external mode" exportName="ExternalMode">
  {#snippet template()}
    <Form owner={external}>
      <Field name="name" inputType="text" label="Full name" />
      <Field name="email" inputType="text" label="Email address" />
      <Button type="submit" disabled={external.isSubmitting}>
        {external.isSubmitting ? "Saving…" : "Send"}
      </Button>
    </Form>
    <SubmittedValues data={externalSubmitted} />
  {/snippet}
</Story>

<Story name="Input types" exportName="InputTypes">
  {#snippet template()}
    <Form onsubmit={logEntries}>
      <Field name="text" inputType="text" label="Text" />
      <Field
        name="select"
        inputType="select"
        label="Select"
        options={[
          { value: "a", label: "Option A" },
          { value: "b", label: "Option B" },
          { value: "c", label: "Option C" },
        ]}
      />
      <Field name="checkbox" inputType="checkbox" label="I agree to the terms" />
      <Field name="range" inputType="range" label="Volume" min={0} max={100} />
      <Field name="date" inputType="date" label="Start date" />
      <Field name="color" inputType="color" label="Brand color" />
    </Form>
  {/snippet}
</Story>

<Story name="Validation" exportName="WithValidation">
  {#snippet template()}
    <Form owner={validation}>
      <Field name="email" inputType="text" label="Email" />
      <Field name="age" inputType="text" label="Age" />
      <Field name="bio" inputType="textarea" label="Bio" isOptional />
      <Button type="submit">Submit</Button>
    </Form>
  {/snippet}
</Story>

<Story name="Conditional field" exportName="ConditionalField">
  {#snippet template()}
    <Form owner={conditional}>
      <Field
        name="role"
        inputType="select"
        label="Role"
        options={[
          { value: "individual", label: "Individual" },
          { value: "company", label: "Company" },
        ]}
      />
      <Field
        name="company_name"
        inputType="text"
        label="Company name"
        condition={(values) => values.role === "company"}
      />
      <Button type="submit">Continue</Button>
    </Form>
  {/snippet}
</Story>

<Story name="Side layout" exportName="SideLayout">
  {#snippet template()}
    <Form onsubmit={logEntries} class="form-layout-side">
      <Field name="first_name" inputType="text" label="First name" />
      <Field name="last_name" inputType="text" label="Last name" />
      <Field name="email" inputType="text" label="Email address" />
      <Button type="submit">Save</Button>
    </Form>
  {/snippet}
</Story>
