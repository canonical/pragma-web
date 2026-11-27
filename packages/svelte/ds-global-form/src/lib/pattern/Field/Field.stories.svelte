<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import StarRating from "../../../storybook/StarRating.svelte";
  import Component from "./Field.svelte";

  /**
   * `Field` is the type-safe entry point to every form input: it dispatches on
   * `inputType` to the matching `*Field` component, so one component drives text,
   * select, checkbox, range, date, custom inputs and more — with per-field
   * validation, required/optional marking and conditional display.
   */
  const { Story } = defineMeta({
    title: "patterns/Field",
    component: Component,
    decorators: [decorators.form()],
    // `description` is editable from the Controls panel — type text to see the
    // field's description slot (its type ramp and the label→description gap) live.
    argTypes: {
      description: {
        control: "text",
        description:
          "Supporting text shown under the label, above the control.",
      },
    },
    args: {
      description: "Supporting help text for this field.",
    },
  });

  // The company field's condition reads the email field's bound value.
  let email = $state("");
</script>

<Story name="Default" args={{ name: "full_name", inputType: "text" }} />

<Story
  name="With Validation"
  args={{
    name: "Board",
    inputType: "text",
    minlength: 5,
    pattern: "[a-zA-Z0-9]+",
  }}
/>

<!-- Default "required" marking: required fields get a "*" before the label (the
marker is a CSS pseudo-element, so it stays out of the accessible name; the
input carries `aria-required`). -->
<Story
  name="Required"
  args={{ name: "required_field", inputType: "text", label: "Display name" }}
/>

<!-- "optional" marking: the convention flips — optional fields are tagged
"(optional)" after the label, and required fields are left unmarked. -->
<Story
  name="Optional Marked"
  args={{
    name: "optional_field",
    inputType: "text",
    label: "Nickname",
    isOptional: true,
    requiredIndicator: "optional",
  }}
/>

<!-- Error state: a required field that has been touched and left empty shows the
field-error message and the `.danger` chrome (red border / focus ring). -->
<Story
  name="With Error"
  args={{
    name: "email",
    inputType: "text",
    label: "Email",
    pattern: "[^\\s@]+@[^\\s@]+\\.[^\\s@]+",
    error: "Email is required",
  }}
/>

<Story name="Type Textarea" args={{ name: "content", inputType: "textarea" }} />

<Story
  name="Type Checkbox"
  args={{ name: "subscribe", inputType: "checkbox", label: "Subscribe" }}
/>

<!-- The router dispatches on `inputType`. Beyond the text/textarea/checkbox cases
above it covers the richer inputs — a few shown here so the single, type-safe
`Field` entry point is visible across the family. -->
<Story
  name="Type Select"
  args={{
    name: "fruit",
    inputType: "select",
    label: "Favourite fruit",
    options: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "cherry", label: "Cherry" },
    ],
  }}
/>

<Story
  name="Type Range"
  args={{ name: "volume", inputType: "range", label: "Volume", min: 0, max: 100 }}
/>

<Story name="Type Date" args={{ name: "starts_on", inputType: "date", label: "Start date" }} />

<Story name="Type Color" args={{ name: "brand", inputType: "color", label: "Brand colour" }} />

<!-- A custom input: `inputType: "custom"` renders the supplied `component`,
which owns its form binding and accessible label. -->
<Story
  name="Type Custom"
  args={{ name: "rating", inputType: "custom", component: StarRating }}
/>

<Story name="Conditional Display" args={{ name: "email", inputType: "text" }}>
  {#snippet template()}
    <div>
      <Component
        name="email"
        inputType="text"
        description="Enter an email address ending with `@gmail.com` and you will be prompted for the company."
        label="Email"
        bind:value={email}
      />
      <Component
        name="company"
        inputType="text"
        label="Company"
        isOptional
        condition={() => email.endsWith("@gmail.com")}
      />
    </div>
  {/snippet}
</Story>
