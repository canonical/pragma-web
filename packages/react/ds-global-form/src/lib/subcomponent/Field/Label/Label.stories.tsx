/* @canonical/generator-ds 0.9.0-experimental.4 */

// Needed for function-based story, safe to remove otherwise
// import type { LabelProps } from './types.js'
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "../../../index.js";
import { SelectInput } from "../../SelectInput/index.js";
import Component from "./Label.js";

// Needed for template-based story, safe to remove otherwise
// import type { StoryFn } from '@storybook/react-vite'

const meta = {
  title: "subcomponents/Field.Label",
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;

/*
  CSF3 story
  Uses object-based story declarations with strong TS support (`Meta` and `StoryObj`).
  Uses the latest storybook format.
*/
type Story = StoryObj<typeof meta>;

/**
 * Default ("required") marking: a required field gets a "*" marker after the
 * label, drawn as a CSS pseudo-element so it never enters the accessible name.
 */
export const Default: Story = {
  args: {
    name: "email",
    children: "What is your email ?",
  },
};

/**
 * In the default ("required") mode an optional field carries no marker at all —
 * only the required ones are tagged.
 */
export const OptionalNoMarker: Story = {
  args: {
    name: "name",
    children: "What is your name ?",
    isOptional: true,
  },
};

/**
 * The alternate ("optional") convention: optional fields are tagged
 * "(optional)" after the label, required ones are left unmarked.
 */
export const OptionalMarked: Story = {
  args: {
    name: "name",
    children: "What is your name ?",
    isOptional: true,
    requiredIndicator: "optional",
  },
};

/** This represents a label for a fieldset, where we do not need an actual html label */
export const SemanticLabel: Story = {
  args: {
    name: "email",
    children: "Email",
    tag: "span",
  },
};

/**
 * The chrome can label a presentational input directly, without a form: wire
 * `Field.Label` to the control with `htmlFor`/`id` and point the control's
 * `aria-describedby` at `Field.Description`. The pieces carry no spacing of
 * their own — the `Field` wrapper gets the gap between fields from
 * `--form-field-block-gap` and the gap between label and control from
 * `--form-field-label-gap` — so lay them out yourself.
 */
export const WithStandaloneInput: Story = {
  args: {
    name: "language",
    children: "Language",
  },
  render: (args) => (
    <div style={{ display: "grid", rowGap: "var(--form-field-label-gap)" }}>
      <Field.Label {...args} htmlFor="standalone-language" />
      <Field.Description id="standalone-language-description">
        Shown in the interface.
      </Field.Description>
      <SelectInput
        id="standalone-language"
        aria-describedby="standalone-language-description"
        options={[
          { value: "en", label: "English" },
          { value: "fr", label: "français" },
        ]}
      />
    </div>
  ),
};
