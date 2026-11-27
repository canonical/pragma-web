# @canonical/svelte-ds-global-form

Svelte 5 form fields for the Pragma design system. The markup, class names and
stylesheets are the same as `@canonical/react-ds-global-form`; the API is
Svelte's: every value is `$bindable`, and native attributes, handlers and
attachments are spread onto the real control.

```svelte
<script lang="ts">
  import "@canonical/styles";
  import "@canonical/svelte-ds-global-form/index.css";
  import { Field, Form } from "@canonical/svelte-ds-global-form";

  let { form } = $props(); // for example a SvelteKit action result
  let email = $state("");
  let newsletter = $state(false);
</script>

<Form method="POST">
  <Field inputType="email" name="email" label="Email" bind:value={email} error={form?.errors?.email} />
  <Field inputType="checkbox" name="newsletter" label="Send me news" isOptional bind:value={newsletter} />
  <Field
    inputType="text"
    name="company"
    label="Company"
    isOptional
    condition={() => email.endsWith("@example.com")}
  />
  <button type="submit">Send</button>
</Form>
```

## Fields

- `Field` routes on `inputType` (`text`, `email`, `tel`, `url`, `password`,
  `number`, `textarea`, `select`, `checkbox`, `switch`, `choices`,
  `rich-choices`, `range`, `date`, `time`, `datetime`, `file`, `phone`,
  `hidden`, `custom`, and the work-in-progress `color`, `rating`, `combobox`).
- `value` is bindable and its type follows `inputType`: a string for text-like
  inputs, a number (or `null` while empty) for `number` and `range`, a boolean
  for `checkbox` and `switch`, a `string[]` for multiple `select` and
  `choices`, `File[]` for `file`. An unbound value is local state, so a plain
  HTML form works unchanged and server rendering shows the value.
- Fields are required unless `isOptional`. Pass a validation message with
  `error`.
- `condition: (values) => boolean` decides whether a field is shown. Inside a
  `Form` with an owner it receives the owner's values; otherwise it closes over
  your own state (it receives `{}`). A hidden field is not rendered, so it is
  not submitted; when a shown field becomes hidden, its value becomes
  `undefined` (in the owner, or in your binding), as in React.
- `inputType: "custom"` renders `component` with no field chrome, as React's
  `CustomComponent`: it receives every prop but `inputType` and `component`
  (`CustomControlProps<Value>` plus any extra props), binds `value`, and
  renders its own label, description and error.
- `Form` renders `form.ds.form.subgrid` and passes native attributes through.
  Use SvelteKit's `enhance` as an attachment:
  `<Form {@attach fromAction(enhance)}>` (`fromAction` from `svelte/attachments`).

## Form owners

Without an `owner`, `Form` is native: fields hold their own values and the
browser posts them, so it works with SvelteKit actions and without JavaScript.
Give `Form` an `owner` and every `Field` inside reads and writes its value,
error and blur through it by `name`, and the owner sees each submit first. An
explicit `bind:value` (when defined) or `error` on a field wins. A field shows
every error the owner returns; when errors appear is the owner's business.

`createFormState()` is the package's owner, opted into per form. It holds
values, errors and touched fields in `$state`, with react-hook-form's options:

```svelte
<Form
  owner={createFormState({
    defaultValues: { email: "" },
    validate: (values) => ({ email: values.email ? undefined : "Email is required" }),
    mode: "onSubmit", // or "onChange", "onBlur", "onTouched"
    onSubmit: (values) => save(values), // unset: a valid form posts natively
  })}
>
```

Every mode validates on submit, and after the first submit a field again on
its every change. An invalid submit does not post and focuses the first
invalid control. The browser's own validation runs first; add `novalidate` to
show the owner's message for a missing required value. The owner also exposes
`errors`, `touched`, `isSubmitted`, `isSubmitting` and `reset()`.

The owner sees each submit before the form's other listeners, and a submit it
stops reaches `onsubmit` but none of them, so `<Form method="POST" owner={…}
{@attach fromAction(enhance)}>` posts only a valid form.

Any object meeting the contract is an owner:

```ts
type FormOwner<Values> = {
  readonly values: Values; // must be reactive under runes, as `$state` is
  setValue(name, value): void; // `undefined` drops the value
  getError?(name): string | undefined;
  blur?(name): void;
  submit?(event: SubmitEvent): void; // may call event.preventDefault()
};
```

- `createBinding(source)` adapts a store that is not reactive under runes, such
  as TanStack Form (`getValues`, `setValue`, `subscribe`, plus the optional
  methods above), into an owner.
- `createValidatedBinding(owner, checks)` adds latest-only asynchronous checks
  per field to an owner that can `reset`. A field keeps its previous message
  while its check runs and when the check fails; a submit is stopped while a
  check's message shows; `validate()` waits for every check.
- `runLatest(work)` runs asynchronous work so only its latest run counts.
- Outside a `Form` with an owner, bind a field yourself:
  `bind:value={() => owner.values.email, (v) => owner.setValue("email", v)}`
  and spread `{...bindField(owner, "email")}` for `error` and `onblur`.

`file` fields post their files without JavaScript: the named file input mirrors
the bound files, including dropped ones. A plain form needs
`enctype="multipart/form-data"` for the browser to send file contents:
`<Form method="POST" enctype="multipart/form-data">`.

Text typed, options chosen and boxes checked before the page hydrates are kept:
the bound value adopts them. `RadioInput` and `PhoneInput` find their server
markup by `id`, which every field provides; used on their own without an `id`,
they lose edits made before hydration.

## Inputs

The presentational inputs work outside a form, for example in a filter bar:
`TextInput`, `NumberInput`, `PasswordInput`, `TextareaInput`, `SelectInput`,
`DateInput`, `TimeInput`, `DateTimeInput`, `RangeInput`, `HiddenInput` and
`PhoneInput` bind `value`; `CheckboxInput`, `SwitchInput` and `RadioInput` bind
`checked`; `FileUploadInput` binds `files`.

## Phone

`PhoneInput` (and `inputType: "phone"`) binds an E.164 string, or a structured
`{ countryCode, number }` with `valueFormat="structured"`. Countries come from
`phoneCountries` in `@canonical/ds-utils`. With a `name`, both controls post
without JavaScript: the number as `<name>` and the country code as
`<name>-country`. On the server, `decodePhone(formData, name)` turns the two
entries into both formats (pass a third `countries` argument for a custom
dataset).
