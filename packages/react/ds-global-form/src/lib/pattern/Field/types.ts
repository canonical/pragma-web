import type { ComponentProps, ComponentType } from "react";
import type { CheckboxField } from "../../component/CheckboxField/index.js";
import type { ChoicesField } from "../../component/ChoicesField/index.js";
import type { ColorField } from "../../component/ColorField/index.js";
import type { ComboboxField } from "../../component/ComboboxField/index.js";
import type { DateField } from "../../component/DateField/index.js";
import type { DateTimeField } from "../../component/DateTimeField/index.js";
import type { FileUploadField } from "../../component/FileUploadField/index.js";
import type { HiddenField } from "../../component/HiddenField/index.js";
import type { NumberField } from "../../component/NumberField/index.js";
import type { PasswordField } from "../../component/PasswordField/index.js";
import type { PhoneField } from "../../component/PhoneField/index.js";
import type { RangeField } from "../../component/RangeField/index.js";
import type { RatingField } from "../../component/RatingField/index.js";
import type { RichChoicesField } from "../../component/RichChoicesField/index.js";
import type { SelectField } from "../../component/SelectField/index.js";
import type { SwitchField } from "../../component/SwitchField/index.js";
import type { TextareaField } from "../../component/TextareaField/index.js";
import type { TextField } from "../../component/TextField/index.js";
import type { TimeField } from "../../component/TimeField/index.js";
import type { NativeInputType } from "../../subcomponent/types.js";

export type {
  BaseInputProps,
  BaseWrapperProps,
  Condition,
  InputProps,
  Middleware,
  WrappedComponentProps,
  WrapperHOCAdditionalProps,
  WrapperProps,
} from "../../common/types.js";
// Shared presentational types live in `subcomponent/types.ts`; the
// field-composition machinery types live in `common/types.ts`. Both are
// re-exported here (the Field pattern's type module) so consumers can import
// them alongside `FieldProps`.
export type {
  NativeInputType,
  Option,
  OptionsProps,
} from "../../subcomponent/types.js";

type ReservedCustomKeys<P> = P extends unknown
  ? Extract<"inputType" | "CustomComponent" | "key", keyof P>
  : never;

type CustomVariant<
  P extends { name: string },
  Whole extends { name: string } = P,
> = P extends unknown
  ? { inputType: "custom"; CustomComponent: ComponentType<Whole> } & NoInfer<P>
  : never;

type TextInputType = Exclude<NativeInputType, "password" | "number">;
type TextVariants = {
  [T in TextInputType]: { inputType: T } & Omit<
    ComponentProps<typeof TextField>,
    "inputType"
  >;
}[TextInputType];

type BuiltinFields =
  | TextVariants
  | ({ inputType: "password" } & ComponentProps<typeof PasswordField>)
  | ({ inputType: "number" } & ComponentProps<typeof NumberField>)
  | ({ inputType: "checkbox" } & ComponentProps<typeof CheckboxField>)
  | ({ inputType: "switch" } & ComponentProps<typeof SwitchField>)
  | ({ inputType: "hidden" } & ComponentProps<typeof HiddenField>)
  | ({ inputType: "range" } & ComponentProps<typeof RangeField>)
  | ({ inputType: "rating" } & ComponentProps<typeof RatingField>)
  | ({ inputType: "select" } & ComponentProps<typeof SelectField>)
  | ({ inputType: "combobox" } & ComponentProps<typeof ComboboxField>)
  | ({ inputType: "choices" } & ComponentProps<typeof ChoicesField>)
  | ({ inputType: "textarea" } & ComponentProps<typeof TextareaField>)
  | ({ inputType: "date" } & ComponentProps<typeof DateField>)
  | ({ inputType: "time" } & ComponentProps<typeof TimeField>)
  | ({ inputType: "datetime" } & ComponentProps<typeof DateTimeField>)
  | ({ inputType: "file" } & ComponentProps<typeof FileUploadField>)
  | ({ inputType: "color" } & ComponentProps<typeof ColorField>)
  | ({ inputType: "phone" } & ComponentProps<typeof PhoneField>)
  | ({ inputType: "rich-choices" } & ComponentProps<typeof RichChoicesField>);

// Field owns the native input type; distribute Omit to preserve toggle unions.
type WithoutNativeType<T> = T extends unknown
  ? Omit<T, "type"> & { type?: never }
  : never;

/**
 * Props for a built-in or custom field. Custom props are inferred from the
 * component in JSX or supplied as the type argument for a field map. They must
 * include a string `name` and cannot declare `inputType`, `CustomComponent`,
 * or React's `key`, which are consumed before the component is rendered.
 */
export type FieldProps<P extends { name: string } = { name: string }> =
  | WithoutNativeType<BuiltinFields>
  | ([ReservedCustomKeys<P>] extends [never] ? CustomVariant<P> : never);
