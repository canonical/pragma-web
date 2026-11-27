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

## Styles

Import the global Pragma styles once, then either every form stylesheet:

```css
@import url("@canonical/styles");
@import url("@canonical/svelte-ds-global-form/index.css");
```

or nothing more: each component imports its own stylesheet, so a bundler that
handles CSS imports (Vite, SvelteKit) loads only the styles of the components
you use. The package marks `**/*.css` as side effects so they are not
tree-shaken.

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

## Remote validation and options

Middleware that changes the control is a Svelte attachment. `{@attach}` on a
`Field` or field component is forwarded to its control, as native attributes
and handlers are.

`validateRemotely(target, options)` checks the value once the user stops
typing and sets the answer as the control's custom validity, so the browser
blocks the submit and the field shows the message:

```svelte
<Field
  inputType="text"
  name="username"
  label="Username"
  {@attach validateRemotely("/api/validate-username", {
    errorExtractor: async (response) => (await response.json()).error,
  })}
/>
```

- `target` is a REST endpoint (`POST { value }` by default; `method`, `headers`,
  `bodyFormatter`, `errorExtractor`), or your own check:
  `(value, signal) => Promise<string | undefined>`, resolving to a message or
  `undefined` when valid.
- `minLength` (3), `debounceWait` (300 ms) and `timeout` (10000 ms) set when it
  checks and how long it waits. Each change cancels the pending check, so only
  the answer for the latest value counts.
- A check that fails to complete, or times out, keeps the previous message.
  A value shorter than `minLength` clears it. Each attachment clears only the
  message it set.
- A submit of a value not yet answered waits for its check, then submits again
  when the value passed. In a `novalidate` form a rejected value still blocks
  the submit.
- Only string values typed or picked by the user are followed; a value written
  by code is checked on submit. Without JavaScript nothing is checked, so
  validate on the server too.

Options are data. Fetch them in a SvelteKit `load` for server rendering, with
`fetchOptions(url, { fetch, transformData })`, and pass them as `options`. To
fetch them in the browser, and again when the URL changes, use
`createRemoteOptions`:

```svelte
<script>
  const fruits = createRemoteOptions(() => `/api/fruits?season=${season}`);
</script>

<Field inputType="select" name="fruit" label="Fruit" {...fruits.fieldProps} />
```

While loading the field is disabled, `aria-busy` and empty; a failed request
becomes its `error` and leaves it enabled; a new URL clears the options and
error while the new ones load. Spread `fieldProps` before your own props.

## Native validity

A field given no `error` (by you or by the owner) shows its control's native
`validationMessage`, from the control's first `invalid` event: a failed
submit, `checkValidity()`, `reportValidity()` or a `validateRemotely`
rejection. From then on it reads the message again on `input`, `change`,
`focusout` and the `ds:validity` event (`VALIDITY_EVENT`), so a fixed value
clears it. A form reset, or hiding the field, stops it until the next
`invalid`. If you call `setCustomValidity("")` yourself, dispatch
`new Event("ds:validity", { bubbles: true })` on the control afterwards, since
the browser fires no event. A custom `component` renders its own error.

## Without JavaScript

Fields render their values on the server, carry native `name`, `required` and
constraint attributes, and post with the form, so a `Form` without an owner
works with SvelteKit actions and with JavaScript disabled. Pass the action's
messages back as `error`. Owners, `condition`, `validateRemotely` and
`createRemoteOptions` need JavaScript; fetch options in `load` to have them on
the server.

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
