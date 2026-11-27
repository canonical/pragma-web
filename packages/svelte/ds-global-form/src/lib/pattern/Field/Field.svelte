<script lang="ts" generics="Extra extends Record<string, unknown> = Record<string, never>, Value = unknown">
  import { ColorField } from "../../_work_in_progress/component/ColorField/index.js";
  import { ComboboxField } from "../../_work_in_progress/component/ComboboxField/index.js";
  import { RatingField } from "../../_work_in_progress/component/RatingField/index.js";
  import { CheckboxField } from "../../component/CheckboxField/index.js";
  import { ChoicesField } from "../../component/ChoicesField/index.js";
  import { DateField } from "../../component/DateField/index.js";
  import { DateTimeField } from "../../component/DateTimeField/index.js";
  import { FileUploadField } from "../../component/FileUploadField/index.js";
  import { HiddenField } from "../../component/HiddenField/index.js";
  import { NumberField } from "../../component/NumberField/index.js";
  import { PasswordField } from "../../component/PasswordField/index.js";
  import { PhoneField } from "../../component/PhoneField/index.js";
  import { RangeField } from "../../component/RangeField/index.js";
  import { RichChoicesField } from "../../component/RichChoicesField/index.js";
  import { SelectField } from "../../component/SelectField/index.js";
  import { SwitchField } from "../../component/SwitchField/index.js";
  import { TextareaField } from "../../component/TextareaField/index.js";
  import { TextField } from "../../component/TextField/index.js";
  import { TimeField } from "../../component/TimeField/index.js";
  import type { FieldProps } from "./types.js";

  let { value = $bindable(), ...props }: FieldProps<Extra, Value> = $props();

  // The field owns the native input type: `inputType` routes and `type` is
  // dropped, so neither reaches the control.
  // biome-ignore lint/suspicious/noExplicitAny: each branch forwards the props of its own variant
  const routed = $derived.by((): any => {
    const {
      inputType: _inputType,
      type: _type,
      ...rest
    } = props as Record<string, unknown>;
    return rest;
  });
  // The bound value's type follows `inputType`, which the branches below
  // narrow; these accessors carry it across without a cast per branch.
  const getValue = () => value as never;
  const setValue = (next: unknown) => {
    value = next as typeof value;
  };
  // A custom component gets every prop but the routing ones, and renders its
  // own label, description and error, as React's `CustomComponent` does.
  // biome-ignore lint/suspicious/noExplicitAny: the component's props are the caller's
  const custom = $derived.by((): any => {
    const {
      inputType: _inputType,
      component,
      ...forwarded
    } = props as Record<string, unknown>;
    return { component, forwarded };
  });
</script>

{#if props.inputType === "textarea"}<TextareaField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "checkbox"}<CheckboxField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "switch"}<SwitchField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "rating"}<RatingField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "range"}<RangeField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "select"}<SelectField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "choices"}<ChoicesField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "combobox"}<ComboboxField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "hidden"}<HiddenField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "date"}<DateField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "time"}<TimeField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "datetime"}<DateTimeField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "file"}<FileUploadField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "color"}<ColorField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "phone"}<PhoneField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "password"}<PasswordField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "number"}<NumberField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "rich-choices"}<RichChoicesField {...routed} bind:value={getValue, setValue} />{:else if props.inputType === "custom"}<custom.component {...custom.forwarded} bind:value={getValue, setValue} />{:else}<TextField {...routed} inputType={props.inputType} bind:value={getValue, setValue} />{/if}

<!-- @component
A form field pairs a single input with the meaning a user needs to act on it: a
label, optional guidance, the input itself, and validation feedback. `Field`
routes on `inputType` to the matching field component, so one entry point
drives every input. Bind `value`; its type follows `inputType`.

`import { Field } from "@canonical/svelte-ds-global-form";`

@implements ds:global.pattern.field
-->
