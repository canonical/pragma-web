import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import expectNoAxeViolations from "../../../../testing/expectNoAxeViolations.js";
import type { Option } from "../../../subcomponent/types.js";
import { ComboboxField } from "../../component/ComboboxField/index.js";
import { ComboboxInput } from "./index.js";

const fruits: Option[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

/** A lookup that never answers, so the combobox stays pending. */
const pendingLookup = () => new Promise<Option | null>(() => {});

/** Opens the list from the text input and highlights the second option. */
const openWithHighlight = async (container: HTMLElement) => {
  (container.querySelector('[role="combobox"]') as HTMLElement).focus();
  await userEvent.keyboard("{ArrowDown}{ArrowDown}");
  await expect
    .poll(() => container.querySelector('[aria-activedescendant^="downshift"]'))
    .not.toBeNull();
};

/** Opens the list on text that matches no option. */
const openWithoutMatch = async (container: HTMLElement) => {
  (container.querySelector('[role="combobox"]') as HTMLElement).focus();
  await userEvent.keyboard("zzz");
  await expect
    .poll(() => container.querySelector('[aria-expanded="true"]'))
    .not.toBeNull();
};

/**
 * Every state the combobox stories show, and the ones a user reaches from
 * them: each is rendered, optionally driven, then checked with axe.
 */
const states: {
  name: string;
  component: typeof ComboboxInput | typeof ComboboxField;
  props: Record<string, unknown>;
  drive?: (container: HTMLElement) => Promise<void>;
}[] = [
  {
    name: "a single combobox named by aria-label",
    component: ComboboxInput,
    props: { "aria-label": "Fruit", options: fruits },
  },
  {
    name: "a multiple combobox named by aria-label",
    component: ComboboxInput,
    props: {
      "aria-label": "Fruits",
      isMultiple: true,
      options: fruits,
      value: [],
    },
  },
  {
    name: "a single field with a value",
    component: ComboboxField,
    props: { name: "fruit", label: "Fruit", options: fruits, value: "apple" },
  },
  {
    name: "a multiple field with chips",
    component: ComboboxField,
    props: {
      name: "fruits",
      label: "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana"],
    },
  },
  {
    name: "a single field with its list open on a highlight",
    component: ComboboxField,
    props: { name: "fruit", label: "Fruit", options: fruits, value: "apple" },
    drive: openWithHighlight,
  },
  {
    name: "a multiple field with its list open on a highlight",
    component: ComboboxField,
    props: {
      name: "fruits",
      label: "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["apple"],
    },
    drive: openWithHighlight,
  },
  {
    name: "a standalone combobox with its list open on a highlight",
    component: ComboboxInput,
    props: { "aria-label": "Fruit", options: fruits },
    drive: openWithHighlight,
  },
  {
    name: "a field with its list open on text that matches nothing",
    component: ComboboxField,
    props: { name: "fruit", label: "Fruit", options: fruits },
    drive: openWithoutMatch,
  },
  {
    name: "a single field with a description and an error",
    component: ComboboxField,
    props: {
      name: "fruit",
      label: "Fruit",
      description: "Seasonal only",
      error: "Pick a fruit",
      options: fruits,
    },
  },
  {
    name: "a multiple field with chips and an error",
    component: ComboboxField,
    props: {
      name: "fruits",
      label: "Fruits",
      isMultiple: true,
      error: "Pick fewer fruits",
      options: fruits,
      value: ["apple", "banana"],
    },
  },
  {
    name: "a disabled single field",
    component: ComboboxField,
    props: {
      name: "fruit",
      label: "Fruit",
      disabled: true,
      options: fruits,
      value: "apple",
    },
  },
  {
    name: "a disabled multiple field with chips",
    component: ComboboxField,
    props: {
      name: "fruits",
      label: "Fruits",
      isMultiple: true,
      disabled: true,
      options: fruits,
      value: ["apple", "banana"],
    },
  },
  {
    name: "a single field whose value lookup is pending",
    component: ComboboxField,
    props: {
      name: "fruit",
      label: "Fruit",
      options: fruits,
      value: "apple",
      convertValueToItem: pendingLookup,
    },
  },
  {
    name: "a multiple field whose value lookups are pending",
    component: ComboboxField,
    props: {
      name: "fruits",
      label: "Fruits",
      isMultiple: true,
      options: fruits,
      value: ["apple", "banana"],
      convertValueToItem: pendingLookup,
    },
  },
];

describe("ComboboxInput accessibility checks", () => {
  it.each(states)(
    "has no axe violation as $name",
    async ({ component, props, drive }) => {
      // biome-ignore lint/suspicious/noExplicitAny: each case's props suit its component
      const page = await render(component as any, props);
      await drive?.(page.container);
      await expectNoAxeViolations(page.container);
    },
  );
});
