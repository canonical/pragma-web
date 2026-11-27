/**
 * Public package surface: the Field and Form patterns with their types, the
 * presentational inputs (with bindable values, usable outside a form) and the
 * phone helpers for decoding a form posted without JavaScript. The field
 * components and the Field chrome are reached through the Field pattern.
 *
 * @module
 */
export type {
  ColorInputProps,
  ComboboxInputProps,
  HexFormat,
  RatingInputProps,
  RatingScale,
} from "./_work_in_progress/index.js";
export {
  ColorInput,
  ComboboxInput,
  RatingInput,
} from "./_work_in_progress/index.js";
export * from "./pattern/index.js";
export type {
  CheckboxInputProps,
  DateInputProps,
  DateTimeInputProps,
  FileUploadInputProps,
  HiddenInputProps,
  NumberInputProps,
  PasswordInputProps,
  PhoneCountry,
  PhoneInputProps,
  PhoneValue,
  RadioInputProps,
  RangeInputProps,
  SelectInputProps,
  SwitchInputProps,
  TextareaInputProps,
  TextInputProps,
  TextInputType,
  TimeInputProps,
} from "./subcomponent/index.js";
export {
  CheckboxInput,
  DateInput,
  DateTimeInput,
  FileUploadInput,
  HiddenInput,
  NumberInput,
  PasswordInput,
  PhoneInput,
  RadioInput,
  RangeInput,
  SelectInput,
  SwitchInput,
  TextareaInput,
  TextInput,
  TimeInput,
} from "./subcomponent/index.js";
export {
  decodePhone,
  extractPhoneDigits,
  formatPhone,
} from "./utils/index.js";
