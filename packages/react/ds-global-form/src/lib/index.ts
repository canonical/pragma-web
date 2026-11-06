// Public package surface: the Field pattern
// (Field + FieldProps + the shared/machinery types it re-exports), the Form
// pattern, the form middleware, and the input subcomponents below. The
// component/ tier is otherwise internal — composed by the Field pattern.
export * from "./pattern/index.js";
// The input subcomponents are exposed directly: presentational inputs with no
// react-hook-form context, for controls that live outside a <Form> — a theme
// or language picker in an application's chrome, a filter bar, a standalone
// rating. Each carries the same input chrome the Field pattern composes. The
// Field chrome subcomponents (Field.Label, Field.Description, Field.Error)
// stay internal: they are reached through the Field pattern.
export type {
  CheckboxInputProps,
  ColorInputProps,
  ComboboxInputProps,
  DateInputProps,
  DateTimeInputProps,
  FileUploadInputProps,
  HexFormat,
  HiddenInputProps,
  NumberInputProps,
  PasswordInputProps,
  PhoneInputProps,
  PhoneValue,
  RadioInputProps,
  RangeInputProps,
  RatingInputProps,
  RatingScale,
  SelectInputProps,
  SwitchInputProps,
  TextareaInputProps,
  TextInputProps,
  TextInputType,
  TimeInputProps,
} from "./subcomponent/index.js";
export {
  CheckboxInput,
  ColorInput,
  ComboboxInput,
  DateInput,
  DateTimeInput,
  FileUploadInput,
  HiddenInput,
  NumberInput,
  PasswordInput,
  PhoneInput,
  RadioInput,
  RangeInput,
  RatingInput,
  SelectInput,
  SwitchInput,
  TextareaInput,
  TextInput,
  TimeInput,
} from "./subcomponent/index.js";
// Value formatting. `Formatter` is the contract for an input whose displayed
// string differs from the one it submits; `useFormattedValue` is the piece worth
// sharing, since keeping the caret stable across a reformat is the hard part.
// Together with `inputType="custom"` they are the seam for a field the package
// does not ship — a card number, say, whose grouping depends on its own value.
export type { Formatter } from "./utils/formatter/index.js";
export {
  applyPattern,
  createFormatterRegisterOptions,
  createPatternFormatter,
  stripToDigits,
} from "./utils/formatter/index.js";
export type {
  UseFormattedValueProps,
  UseFormattedValueResult,
} from "./utils/hooks/index.js";
export { useFormattedValue } from "./utils/hooks/index.js";
export * from "./utils/middleware/index.js";
