/**
 * The React story files this package mirrors, each paired with its Svelte
 * counterpart. Paths are relative to each package's `src/`; both packages keep
 * work-in-progress inputs under `_work_in_progress/`.
 */
export const storyFilePairs: ReadonlyArray<readonly [string, string]> = [
  [
    "lib/common/Wrapper/Wrapper.stories.tsx",
    "lib/common/Wrapper/Wrapper.stories.svelte",
  ],
  ...[
    "CheckboxInput",
    "DateInput",
    "DateTimeInput",
    "FileUploadInput",
    "HiddenInput",
    "NumberInput",
    "PasswordInput",
    "PhoneInput",
    "RadioInput",
    "RangeInput",
    "SelectInput",
    "SwitchInput",
    "TextareaInput",
    "TextInput",
    "TimeInput",
  ].map(
    (name) =>
      [
        `lib/subcomponent/${name}/${name}.stories.tsx`,
        `lib/subcomponent/${name}/${name}.stories.svelte`,
      ] as const,
  ),
  ...["Description", "Error", "Label"].map(
    (name) =>
      [
        `lib/subcomponent/Field/${name}/${name}.stories.tsx`,
        `lib/subcomponent/Field/${name}/${name}.stories.svelte`,
      ] as const,
  ),
  ...[
    "CheckboxField",
    "ChoicesField",
    "DateField",
    "DateTimeField",
    "FileUploadField",
    "HiddenField",
    "NumberField",
    "PasswordField",
    "PhoneField",
    "RangeField",
    "RichChoicesField",
    "SelectField",
    "SwitchField",
    "TextareaField",
    "TextField",
    "TimeField",
  ].map(
    (name) =>
      [
        `lib/component/${name}/${name}.stories.tsx`,
        `lib/component/${name}/${name}.stories.svelte`,
      ] as const,
  ),
  ...["ChoicesField", "RichChoicesField"].map(
    (name) =>
      [
        `lib/component/${name}/common/Option/Option.stories.tsx`,
        `lib/component/${name}/common/Option/Option.stories.svelte`,
      ] as const,
  ),
  [
    "lib/pattern/Field/Field.stories.tsx",
    "lib/pattern/Field/Field.stories.svelte",
  ],
  ["lib/pattern/Form/Form.stories.tsx", "lib/pattern/Form/Form.stories.svelte"],
  [
    "lib/utils/middleware/middleware.stories.tsx",
    "lib/utils/middleware/middleware.stories.svelte",
  ],
  ...["ColorField", "ComboboxField", "RatingField"].map(
    (name) =>
      [
        `lib/_work_in_progress/component/${name}/${name}.stories.tsx`,
        `lib/_work_in_progress/component/${name}/${name}.stories.svelte`,
      ] as const,
  ),
  ...["ColorInput", "ComboboxInput", "RatingInput"].map(
    (name) =>
      [
        `lib/_work_in_progress/subcomponent/${name}/${name}.stories.tsx`,
        `lib/_work_in_progress/subcomponent/${name}/${name}.stories.svelte`,
      ] as const,
  ),
  ...["List", "ResetButton"].map(
    (name) =>
      [
        `lib/_work_in_progress/subcomponent/ComboboxInput/common/${name}/${name}.stories.tsx`,
        `lib/_work_in_progress/subcomponent/ComboboxInput/common/${name}/${name}.stories.svelte`,
      ] as const,
  ),
  [
    "lib/_work_in_progress/DensityTestbed/DensityTestbed.stories.tsx",
    "lib/_work_in_progress/DensityTestbed/DensityTestbed.stories.svelte",
  ],
  ["docs/Surfaces.stories.tsx", "docs/Surfaces.stories.svelte"],
  ["docs/GettingStarted.stories.tsx", "docs/GettingStarted.stories.svelte"],
  [
    "docs/examples/DensityExamples.stories.tsx",
    "docs/examples/DensityExamples.stories.svelte",
  ],
];

/**
 * Stories a Svelte file adds to its React counterpart, by Svelte path. Binding
 * a field to an owner outside a `Form` has no React equivalent.
 */
export const svelteOnlyStories: Readonly<Record<string, readonly string[]>> = {
  "lib/pattern/Form/Form.stories.svelte": ["Bind Field"],
};

/**
 * Stories a React file has that its Svelte counterpart does not mirror yet, by
 * React path. The file upload's live upload and per-file messages land in
 * React first; the Svelte port adds these stories and empties this list.
 */
export const pendingSvelteStories: Readonly<Record<string, readonly string[]>> =
  {
    "lib/subcomponent/FileUploadInput/FileUploadInput.stories.tsx": [
      "With Files",
      "Drag Over",
      "Live",
      "Uploading",
      "Upload Failed",
      "File Messages",
      "Single File Chosen",
    ],
    "lib/component/FileUploadField/FileUploadField.stories.tsx": [
      "Live",
      "Upload Failed",
      "File Messages",
    ],
  };
