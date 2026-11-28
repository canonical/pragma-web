/**
 * Field states whose server-rendered markup is compared between the React and
 * Svelte form packages. Each case lists the props shared by both `Field`
 * patterns, plus an optional error message and value: React receives them as
 * a react-hook-form error and default value, Svelte as the `error` and `value`
 * props.
 */
export type GoldenCase = {
  props: Record<string, unknown> & { inputType: string; name: string };
  error?: string;
  value?: unknown;
};

import {
  longNamedIso,
  reportPdf,
  sampleFile,
  sampleImage,
  stalledUpload,
  warnOnLargeFiles,
} from "../storybook/fixtures.files.js";

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry", disabled: true },
];

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

export const goldenCases: Record<string, GoldenCase> = {
  "text-default": {
    props: { inputType: "text", name: "username", label: "Username" },
  },
  "text-description": {
    props: {
      inputType: "text",
      name: "username",
      label: "Username",
      description: "Help",
    },
  },
  "text-description-trailing": {
    props: {
      inputType: "text",
      name: "username",
      label: "Username",
      description: "Help",
      descriptionPosition: "trailing",
    },
  },
  "text-error": {
    props: { inputType: "text", name: "email", label: "Email" },
    error: "Email is required",
  },
  "text-optional-marked": {
    props: {
      inputType: "text",
      name: "nickname",
      label: "Nickname",
      isOptional: true,
      requiredIndicator: "optional",
    },
  },
  "text-optional-unmarked": {
    props: {
      inputType: "text",
      name: "nickname",
      label: "Nickname",
      isOptional: true,
    },
  },
  "text-disabled": {
    props: { inputType: "text", name: "code", label: "Code", disabled: true },
  },
  "text-prefix-suffix": {
    props: {
      inputType: "text",
      name: "site",
      label: "Site",
      prefix: "https://",
      suffix: ".com",
    },
  },
  "text-placeholder": {
    props: {
      inputType: "text",
      name: "city",
      label: "City",
      placeholder: "Paris",
      autoComplete: "address-level2",
    },
  },
  email: { props: { inputType: "email", name: "email", label: "Email" } },
  tel: { props: { inputType: "tel", name: "tel", label: "Telephone" } },
  url: { props: { inputType: "url", name: "url", label: "Website" } },
  password: {
    props: { inputType: "password", name: "password", label: "Password" },
  },
  "password-not-revealable": {
    props: {
      inputType: "password",
      name: "password",
      label: "Password",
      revealable: false,
    },
  },
  "password-error": {
    props: { inputType: "password", name: "password", label: "Password" },
    error: "Too short",
  },
  number: { props: { inputType: "number", name: "count", label: "Count" } },
  "number-prefix-suffix": {
    props: {
      inputType: "number",
      name: "price",
      label: "Price",
      prefix: "$",
      suffix: "USD",
      min: 0,
      max: 10,
      step: 1,
    },
  },
  textarea: {
    props: { inputType: "textarea", name: "bio", label: "Bio", rows: 4 },
  },
  "textarea-error": {
    props: { inputType: "textarea", name: "bio", label: "Bio" },
    error: "Bio is required",
  },
  select: {
    props: { inputType: "select", name: "fruit", label: "Fruit", options },
  },
  "select-multiple": {
    props: {
      inputType: "select",
      name: "fruit",
      label: "Fruit",
      options,
      multiple: true,
    },
  },
  "select-error": {
    props: { inputType: "select", name: "fruit", label: "Fruit", options },
    error: "Pick a fruit",
  },
  checkbox: {
    props: { inputType: "checkbox", name: "terms", label: "Accept terms" },
  },
  "checkbox-heading": {
    props: {
      inputType: "checkbox",
      name: "terms",
      label: "Terms",
      controlLabel: "I accept the terms",
      description: "Read them first",
    },
  },
  "checkbox-error": {
    props: { inputType: "checkbox", name: "terms", label: "Accept terms" },
    error: "You must accept",
  },
  "checkbox-description-error": {
    props: {
      inputType: "checkbox",
      name: "terms",
      label: "Accept terms",
      description: "Read them first",
    },
    error: "You must accept",
  },
  "checkbox-optional": {
    props: {
      inputType: "checkbox",
      name: "news",
      label: "Newsletter",
      isOptional: true,
      requiredIndicator: "optional",
    },
  },
  switch: {
    props: { inputType: "switch", name: "dark", label: "Dark mode" },
  },
  "switch-after": {
    props: {
      inputType: "switch",
      name: "dark",
      label: "Dark mode",
      labelPosition: "after",
    },
  },
  choices: {
    props: { inputType: "choices", name: "size", label: "Size", options },
  },
  "choices-multiple": {
    props: {
      inputType: "choices",
      name: "size",
      label: "Size",
      options,
      isMultiple: true,
    },
  },
  "choices-stacked": {
    props: {
      inputType: "choices",
      name: "size",
      label: "Size",
      options,
      layout: "stacked",
    },
  },
  "choices-columns": {
    props: {
      inputType: "choices",
      name: "size",
      label: "Size",
      options,
      layout: "columns",
      columns: 3,
    },
  },
  "choices-error": {
    props: { inputType: "choices", name: "size", label: "Size", options },
    error: "Pick a size",
  },
  "choices-disabled": {
    props: {
      inputType: "choices",
      name: "size",
      label: "Size",
      options,
      disabled: true,
    },
  },
  "choices-description": {
    props: {
      inputType: "choices",
      name: "size",
      label: "Size",
      options,
      description: "Pick one",
    },
  },
  "rich-choices": {
    props: { inputType: "rich-choices", name: "plan", label: "Plan", options },
  },
  "rich-choices-multiple": {
    props: {
      inputType: "rich-choices",
      name: "plan",
      label: "Plan",
      options,
      isMultiple: true,
    },
  },
  "rich-choices-description-error": {
    props: {
      inputType: "rich-choices",
      name: "plan",
      label: "Plan",
      options,
      description: "Billed monthly",
    },
    error: "Pick a plan",
  },
  range: {
    props: {
      inputType: "range",
      name: "volume",
      label: "Volume",
      min: 0,
      max: 100,
    },
  },
  "range-error": {
    props: {
      inputType: "range",
      name: "volume",
      label: "Volume",
      min: 0,
      max: 10,
      step: 2,
    },
    error: "Too loud",
  },
  date: {
    props: {
      inputType: "date",
      name: "starts",
      label: "Start date",
      min: "2026-01-01",
      max: "2026-12-31",
    },
  },
  time: {
    props: { inputType: "time", name: "at", label: "Time", step: 60 },
  },
  datetime: {
    props: {
      inputType: "datetime",
      name: "when",
      label: "When",
      description: "Local time",
    },
  },
  file: {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      accept: "image/*",
      multiple: true,
    },
  },
  "file-disabled": {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      disabled: true,
    },
  },
  "file-optional-description": {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      isOptional: true,
      description: "PDF only",
    },
  },
  "file-error": {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      description: "PDF only",
      multiple: true,
    },
    error: "You can upload at most 2 files.",
  },
  "file-with-files": {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      multiple: true,
    },
    value: [reportPdf(), sampleImage(), longNamedIso()],
  },
  "file-messages": {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      multiple: true,
      accept: ".pdf",
      maxSize: 10 * 1024 * 1024,
      validateFile: warnOnLargeFiles,
    },
    value: [
      sampleFile("notes.txt", 2048, "text/plain"),
      sampleFile("scan.pdf", 12 * 1024 * 1024, "application/pdf"),
      sampleFile("brochure.pdf", 3 * 1024 * 1024, "application/pdf"),
    ],
  },
  "file-single-chosen": {
    props: { inputType: "file", name: "upload", label: "Upload" },
    value: [reportPdf()],
  },
  "file-single-chosen-error": {
    props: { inputType: "file", name: "upload", label: "Upload" },
    error: "Upload is required",
    value: [reportPdf()],
  },
  "file-live": {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      multiple: true,
      upload: stalledUpload(0.45),
      showFileSize: false,
    },
    value: [reportPdf()],
  },
  "file-without-drop-area": {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      multiple: true,
      showDropArea: false,
    },
    value: [reportPdf(), sampleImage()],
  },
  "file-without-drop-area-error": {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      multiple: true,
      showDropArea: false,
    },
    error: "Upload is required",
    value: [reportPdf(), sampleImage()],
  },
  "file-without-drop-area-empty-error": {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      showDropArea: false,
    },
    error: "Upload is required",
  },
  "file-without-file-list": {
    props: {
      inputType: "file",
      name: "upload",
      label: "Upload",
      multiple: true,
      showFileList: false,
    },
    value: [reportPdf(), sampleImage()],
  },
  hidden: { props: { inputType: "hidden", name: "token" } },
  "hidden-error": {
    props: { inputType: "hidden", name: "token" },
    error: "Token expired",
  },
  phone: {
    props: {
      inputType: "phone",
      name: "phone",
      label: "Phone",
      filteredCountries: ["GB", "US", "FR"],
    },
  },
  "phone-name": {
    props: {
      inputType: "phone",
      name: "phone",
      label: "Phone",
      filteredCountries: ["GB", "US"],
      countryDisplay: "name",
      defaultCountry: "GB",
    },
  },
  "phone-description-error": {
    props: {
      inputType: "phone",
      name: "phone",
      label: "Phone",
      description: "Mobile preferred",
      filteredCountries: ["GB", "US"],
    },
    error: "Enter a phone number",
  },
  color: { props: { inputType: "color", name: "brand", label: "Brand" } },
  "color-inline": {
    props: { inputType: "color", name: "brand", label: "Brand", swatches: [] },
  },
  rating: { props: { inputType: "rating", name: "stars", label: "Rating" } },
  "rating-half": {
    props: {
      inputType: "rating",
      name: "stars",
      label: "Rating",
      allowHalf: true,
      count: 10,
    },
  },
  // The combobox cases. An open list with a highlighted item has no case:
  // React's ComboboxInput passes no `initialIsOpen` or
  // `initialHighlightedIndex` to downshift, and shows the list popover from an
  // effect, so a server render is always closed.
  "combobox-single-empty": {
    props: {
      inputType: "combobox",
      name: "fruit",
      label: "Fruit",
      options: fruits,
    },
  },
  "combobox-single-value": {
    props: {
      inputType: "combobox",
      name: "fruit",
      label: "Fruit",
      options: fruits,
    },
    value: "banana",
  },
  "combobox-disabled": {
    props: {
      inputType: "combobox",
      name: "fruit",
      label: "Fruit",
      options: fruits,
      disabled: true,
    },
    value: "apple",
  },
  "combobox-placeholder": {
    props: {
      inputType: "combobox",
      name: "fruit",
      label: "Fruit",
      options: fruits,
      placeholder: "Pick a fruit",
    },
  },
  "combobox-description-error": {
    props: {
      inputType: "combobox",
      name: "fruit",
      label: "Fruit",
      options: fruits,
      description: "Seasonal only",
    },
    error: "Pick a fruit",
  },
  "combobox-multiple-empty": {
    props: {
      inputType: "combobox",
      name: "fruits",
      label: "Fruits",
      options: fruits,
      isMultiple: true,
    },
    value: [],
  },
  "combobox-multiple-chips": {
    props: {
      inputType: "combobox",
      name: "fruits",
      label: "Fruits",
      options: fruits,
      isMultiple: true,
    },
    value: ["apple", "banana"],
  },
};
