import type { Component } from "svelte";
import type { ColorFieldProps } from "../../_work_in_progress/component/ColorField/types.js";
import type { ComboboxFieldProps } from "../../_work_in_progress/component/ComboboxField/types.js";
import type { RatingFieldProps } from "../../_work_in_progress/component/RatingField/types.js";
import type { FieldChromeProps } from "../../common/types.js";
import type { CheckboxFieldProps } from "../../component/CheckboxField/types.js";
import type { ChoicesFieldProps } from "../../component/ChoicesField/types.js";
import type { DateFieldProps } from "../../component/DateField/types.js";
import type { DateTimeFieldProps } from "../../component/DateTimeField/types.js";
import type { FileUploadFieldProps } from "../../component/FileUploadField/types.js";
import type { HiddenFieldProps } from "../../component/HiddenField/types.js";
import type { NumberFieldProps } from "../../component/NumberField/types.js";
import type { PasswordFieldProps } from "../../component/PasswordField/types.js";
import type { PhoneFieldProps } from "../../component/PhoneField/types.js";
import type { RangeFieldProps } from "../../component/RangeField/types.js";
import type { RichChoicesFieldProps } from "../../component/RichChoicesField/types.js";
import type { SelectFieldProps } from "../../component/SelectField/types.js";
import type { SwitchFieldProps } from "../../component/SwitchField/types.js";
import type { TextareaFieldProps } from "../../component/TextareaField/types.js";
import type { TextFieldProps } from "../../component/TextField/types.js";
import type { TimeFieldProps } from "../../component/TimeField/types.js";

export type {
  Condition,
  ControlProps,
  FieldChromeProps,
} from "../../common/types.js";
export type {
  NativeInputType,
  Option,
  OptionsProps,
} from "../../subcomponent/types.js";

/** Native input types rendered by the TextField. */
type TextInputType = "text" | "email" | "tel" | "url";

/** Every built-in field, discriminated by `inputType`. */
type BuiltinFields =
  | ({ inputType: TextInputType } & Omit<TextFieldProps, "inputType">)
  | ({ inputType: "password" } & PasswordFieldProps)
  | ({ inputType: "number" } & NumberFieldProps)
  | ({ inputType: "checkbox" } & CheckboxFieldProps)
  | ({ inputType: "switch" } & SwitchFieldProps)
  | ({ inputType: "hidden" } & HiddenFieldProps)
  | ({ inputType: "range" } & RangeFieldProps)
  | ({ inputType: "rating" } & RatingFieldProps)
  | ({ inputType: "select" } & SelectFieldProps)
  | ({ inputType: "combobox" } & ComboboxFieldProps)
  | ({ inputType: "choices" } & ChoicesFieldProps)
  | ({ inputType: "textarea" } & TextareaFieldProps)
  | ({ inputType: "date" } & DateFieldProps)
  | ({ inputType: "time" } & TimeFieldProps)
  | ({ inputType: "datetime" } & DateTimeFieldProps)
  | ({ inputType: "file" } & FileUploadFieldProps)
  | ({ inputType: "color" } & ColorFieldProps)
  | ({ inputType: "phone" } & PhoneFieldProps)
  | ({ inputType: "rich-choices" } & RichChoicesFieldProps);

/**
 * What a custom component receives from `Field`: every field prop but
 * `inputType` and `component`, including its bindable `value`. It renders its
 * own label, description and error, as React's `CustomComponent` does.
 */
export type CustomControlProps<Value = unknown> = FieldChromeProps & {
  /** Where the description sits: above the control or below it. */
  descriptionPosition?: "leading" | "trailing";
  /** The custom control's value. Bindable. */
  value?: Value;
};

/**
 * A custom field: `component` is rendered without field chrome and receives
 * every other prop, including the bindable `value`.
 */
export type CustomFieldProps<
  Extra extends Record<string, unknown> = Record<string, never>,
  Value = unknown,
> = CustomControlProps<Value> &
  Extra & {
    inputType: "custom";
    component: Component<CustomControlProps<Value> & Extra, object, "value">;
  };

/**
 * Props for a built-in or custom field. `value` follows `inputType`: a string
 * for text-like inputs, a number for number and range, a boolean for checkbox
 * and switch, and so on.
 */
export type FieldProps<
  Extra extends Record<string, unknown> = Record<string, never>,
  Value = unknown,
> = BuiltinFields | CustomFieldProps<Extra, Value>;
