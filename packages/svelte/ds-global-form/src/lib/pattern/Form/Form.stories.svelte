<script lang="ts" module>
  import { Button } from "@canonical/svelte-ds-global";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import * as fieldMaps from "../../../storybook/fixtures.fields.js";
  import SubmittedValues from "../../../storybook/SubmittedValues.svelte";
  import bindField from "../../utils/owner/bindField.js";
  import createFormState from "../../utils/owner/createFormState.svelte.js";
  import { Field } from "../Field/index.js";
  import type { FieldProps } from "../Field/types.js";
  import Component from "./Form.svelte";

  /**
   * A `Form` renders as a **subgrid**: it inherits the columns of the parent grid
   * (`.grid.responsive` / `.grid.intrinsic`) and passes them down to each `Field`,
   * so labels, inputs and multi-column spans all align to one shared grid.
   *
   * ```
   * <div class="grid responsive">   ← parent grid (from the story `grid` param)
   *   <Form>                         ← form subgrid
   *     <Field ... />                ← field subgrid
   *   </Form>
   * </div>
   * ```
   *
   * The first stories drive a real form owner, `createFormState()`, through
   * the `Form` component, so submit, validation and collected values are live
   * — the readout prints submitted values. Fields read and write the owner by
   * `name`. The reference stories at the end render every input type from a
   * fixture to show the field set at a glance.
   */
  const { Story } = defineMeta({
    title: "patterns/Form",
    parameters: { layout: "padded", grid: "responsive" },
  });

  const plans = [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
    { value: "team", label: "Team" },
  ];
  const countries = [
    { value: "gb", label: "United Kingdom" },
    { value: "us", label: "United States" },
    { value: "de", label: "Germany" },
  ];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  type Values = Record<string, unknown>;

  let signUpSubmitted = $state<Values | null>(null);
  const signUp = createFormState<Values>({
    mode: "onBlur",
    validate: (values) => ({
      email: values.email ? undefined : "Email is required",
      password: !values.password
        ? "Password is required"
        : String(values.password).length < 8
          ? "At least 8 characters"
          : undefined,
    }),
    onSubmit: (values) => {
      signUpSubmitted = values;
    },
  });

  const validation = createFormState<Values>({
    mode: "onBlur",
    validate: (values) => ({
      email: !values.email
        ? "Email is required"
        : emailPattern.test(String(values.email))
          ? undefined
          : "Enter a valid email address",
      age:
        values.age === undefined || values.age === null
          ? "Age is required"
          : Number(values.age) < 18
            ? "Must be at least 18"
            : undefined,
    }),
    onSubmit: () => {},
  });

  let editRecordSubmitted = $state<Values | null>(null);
  const editRecord = createFormState<Values>({
    defaultValues: {
      full_name: "Ada Lovelace",
      email: "ada@example.com",
      plan: "pro",
    },
    onSubmit: (values) => {
      editRecordSubmitted = values;
    },
  });

  const multiColumn = createFormState({ onSubmit: () => {} });
  const sideLayout = createFormState({ onSubmit: () => {} });

  let newsletterSubmitted = $state<Values | null>(null);
  const newsletter = createFormState<{ email: string }>({
    defaultValues: { email: "" },
    mode: "onTouched",
    validate: (values) => ({
      email: values.email ? undefined : "Email is required",
    }),
    onSubmit: (values) => {
      newsletterSubmitted = values;
    },
  });
</script>

<!-- A realistic sign-up form: a handful of related fields, a required rule, and a
submit button whose collected values are shown below. This is what a product
form actually looks like — not a dump of every input type. -->
<Story name="Sign Up">
  {#snippet template()}
    <Component owner={signUp}>
      <Field name="full_name" inputType="text" label="Full name" />
      <Field name="email" inputType="text" label="Email address" />
      <Field
        name="password"
        inputType="password"
        label="Password"
        description="At least 8 characters"
      />
      <Field name="plan" inputType="select" label="Plan" options={plans} />
      <Field
        name="terms"
        inputType="checkbox"
        controlLabel="I agree to the terms of service"
      />
      <Button importance="primary" type="submit">Create account</Button>
    </Component>
    <SubmittedValues data={signUpSubmitted} />
  {/snippet}
</Story>

<!-- Validation on a real submit: the owner's `validate` function surfaces its
messages when the field is blurred (`mode: "onBlur"`) or the form is submitted —
no decorator trickery. Submit with empty/invalid values to see the error state. -->
<Story name="Validation">
  {#snippet template()}
    <Component owner={validation}>
      <Field name="email" inputType="text" label="Email" />
      <Field name="age" inputType="number" label="Age" />
      <Field name="bio" inputType="textarea" label="Bio" isOptional />
      <Button importance="primary" type="submit">Submit</Button>
    </Component>
  {/snippet}
</Story>

<!-- Editing an existing record: `defaultValues` pre-fills the form, so the fields
mount populated and submit yields the (possibly edited) record. -->
<Story name="Edit Record">
  {#snippet template()}
    <Component owner={editRecord}>
      <Field name="full_name" inputType="text" label="Full name" />
      <Field name="email" inputType="text" label="Email address" />
      <Field name="plan" inputType="select" label="Plan" options={plans} />
      <Button importance="primary" type="submit">Save changes</Button>
    </Component>
    <SubmittedValues data={editRecordSubmitted} />
  {/snippet}
</Story>

<!-- Multi-column layout: fields default to full width, but `--form-field-columns`
lets a field span part of the grid so two can share a row. Here the city and
postcode sit side by side (`1 / 5` and `5 / -1`) while the other fields stay
full width — the whole form still aligns to one subgrid. -->
<Story name="Multi Column Layout">
  {#snippet template()}
    <Component owner={multiColumn}>
      <Field name="street" inputType="text" label="Street address" />
      <Field
        name="city"
        inputType="text"
        label="City"
        style="--form-field-columns: 1 / 5"
      />
      <Field
        name="postcode"
        inputType="text"
        label="Postcode"
        style="--form-field-columns: 5 / -1"
      />
      <Field name="country" inputType="select" label="Country" options={countries} />
      <Button importance="primary" type="submit">Continue</Button>
    </Component>
  {/snippet}
</Story>

<!-- Side layout: `.form-layout-side` places each label beside its input (label in
columns 1–2, input in 3-to-end) instead of stacked above it — useful for
settings-style forms. -->
<Story name="Side Layout">
  {#snippet template()}
    <Component owner={sideLayout} class="form-layout-side">
      <Field name="first_name" inputType="text" label="First name" />
      <Field name="last_name" inputType="text" label="Last name" />
      <Field name="email" inputType="text" label="Email address" />
      <Field name="phone" inputType="phone" label="Phone number" isOptional />
      <Field name="company" inputType="text" label="Company" isOptional />
      <Field name="job_title" inputType="text" label="Job title" isOptional />
      <Field name="country" inputType="select" label="Country" options={countries} />
      <Field
        name="timezone"
        inputType="select"
        label="Timezone"
        options={[
          { value: "utc", label: "UTC" },
          { value: "cet", label: "CET" },
          { value: "pst", label: "PST" },
        ]}
      />
      <Field
        name="bio"
        inputType="textarea"
        label="About you"
        description="A short description for your profile"
        isOptional
      />
      <Field
        name="newsletter"
        inputType="checkbox"
        controlLabel="Subscribe to the newsletter"
      />
      <Button importance="primary" type="submit">Save</Button>
    </Component>
  {/snippet}
</Story>

<!-- Reference stories — every input type from a fixture, using the decorator's
own owner (no submit), to show the field set at a glance. -->
{#snippet fixtureTemplate(args: {
  fieldMap: FieldProps[];
  otherProps?: { disabled?: boolean; isOptional?: boolean };
})}
  {#each args.fieldMap as props (props.name)}{@const field = { ...props, ...args.otherProps } as FieldProps}<Field {...field} />{/each}
{/snippet}

<!-- Every supported input type, rendered from the shared fixture. -->
<Story
  name="All Input Types"
  args={{ fieldMap: fieldMaps.base }}
  decorators={[decorators.form()]}
  template={fixtureTemplate}
/>

<!-- The same field set, disabled throughout. -->
<Story
  name="All Disabled"
  args={{ fieldMap: fieldMaps.base, otherProps: { disabled: true } }}
  decorators={[decorators.form()]}
  template={fixtureTemplate}
/>

<!-- The same field set with the optional-marking house style applied. -->
<Story
  name="All Optional"
  args={{ fieldMap: fieldMaps.base, otherProps: { isOptional: true } }}
  decorators={[decorators.form()]}
  template={fixtureTemplate}
/>

<!-- Outside a `Form` with an owner, bind a field to an owner yourself: a function
binding for the value, and `bindField(owner, name)` spread for the error and the
blur handler. Here the form has no owner and only the email field reads one, so
the submit handler calls the owner's `submit` itself. -->
<Story name="Bind Field">
  {#snippet template()}
    <Component onsubmit={newsletter.submit}>
      <Field
        name="email"
        inputType="email"
        label="Email address"
        description="We send one email a month."
        bind:value={() => newsletter.values.email, (value) => newsletter.setValue("email", value)}
        {...bindField(newsletter, "email")}
      />
      <Button importance="primary" type="submit">Subscribe</Button>
    </Component>
    <SubmittedValues data={newsletterSubmitted} />
  {/snippet}
</Story>
