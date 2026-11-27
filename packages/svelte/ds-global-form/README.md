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
- `condition: (values) => boolean` decides whether a field is shown. Without a
  form owner the predicate closes over your own state (it receives `{}`). A
  hidden field is not rendered, so it is not submitted; when a shown field
  becomes hidden, its bound value becomes `undefined`, as in React.
- `inputType: "custom"` renders `component` with no field chrome, as React's
  `CustomComponent`: it receives every prop but `inputType` and `component`
  (`CustomControlProps<Value>` plus any extra props), binds `value`, and
  renders its own label, description and error.
- `Form` renders `form.ds.form.subgrid` and passes native attributes through.
  Use SvelteKit's `enhance` as an attachment:
  `<Form {@attach fromAction(enhance)}>` (`fromAction` from `svelte/attachments`).

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
