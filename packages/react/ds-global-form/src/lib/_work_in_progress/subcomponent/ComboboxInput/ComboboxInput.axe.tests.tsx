import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, it } from "vitest";
import expectNoAxeViolations from "../../../../testing/expectNoAxeViolations.js";
import type { Option } from "../../../subcomponent/types.js";
import { ComboboxField } from "../../component/ComboboxField/index.js";
import { ComboboxInput } from "./ComboboxInput.js";

const fruits: Option[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

/** A lookup that never answers, so the combobox stays pending. */
const pendingLookup = () => new Promise<Option | null>(() => {});

/** A field in a form whose value, and error, the case sets. */
function FieldForm({
  value,
  error,
  ...props
}: React.ComponentProps<typeof ComboboxField> & {
  value?: string | string[];
  error?: string;
}) {
  const methods = useForm({
    defaultValues: { [props.name]: value },
    errors: error
      ? { [props.name]: { type: "manual", message: error } }
      : undefined,
  });
  return (
    <FormProvider {...methods}>
      <form>
        <ComboboxField {...props} />
      </form>
    </FormProvider>
  );
}

/** Opens the list from the text input and highlights the second option. */
const openWithHighlight = () => {
  const input = screen.getByRole("combobox");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
};

/** Opens the list on text that matches no option. */
const openWithoutMatch = () => {
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzz" } });
};

/**
 * Every state the combobox stories show, and the ones a user reaches from
 * them: each is rendered, optionally driven, then checked with axe. The
 * same states are checked in the Svelte form package.
 */
const states: {
  name: string;
  element: React.ReactElement;
  drive?: () => void;
}[] = [
  {
    name: "a single combobox named by aria-label",
    element: <ComboboxInput aria-label="Fruit" options={fruits} />,
  },
  {
    name: "a multiple combobox named by aria-label",
    element: (
      <ComboboxInput
        aria-label="Fruits"
        isMultiple
        options={fruits}
        value={[]}
      />
    ),
  },
  {
    name: "a single field with a value",
    element: (
      <FieldForm name="fruit" label="Fruit" options={fruits} value="apple" />
    ),
  },
  {
    name: "a multiple field with chips",
    element: (
      <FieldForm
        name="fruits"
        label="Fruits"
        isMultiple
        options={fruits}
        value={["apple", "banana"]}
      />
    ),
  },
  {
    name: "a single field with its list open on a highlight",
    element: (
      <FieldForm name="fruit" label="Fruit" options={fruits} value="apple" />
    ),
    drive: openWithHighlight,
  },
  {
    name: "a multiple field with its list open on a highlight",
    element: (
      <FieldForm
        name="fruits"
        label="Fruits"
        isMultiple
        options={fruits}
        value={["apple"]}
      />
    ),
    drive: openWithHighlight,
  },
  {
    name: "a standalone combobox with its list open on a highlight",
    element: <ComboboxInput aria-label="Fruit" options={fruits} />,
    drive: openWithHighlight,
  },
  {
    name: "a field with its list open on text that matches nothing",
    element: <FieldForm name="fruit" label="Fruit" options={fruits} />,
    drive: openWithoutMatch,
  },
  {
    name: "a single field with a description and an error",
    element: (
      <FieldForm
        name="fruit"
        label="Fruit"
        description="Seasonal only"
        error="Pick a fruit"
        options={fruits}
      />
    ),
  },
  {
    name: "a multiple field with chips and an error",
    element: (
      <FieldForm
        name="fruits"
        label="Fruits"
        isMultiple
        error="Pick fewer fruits"
        options={fruits}
        value={["apple", "banana"]}
      />
    ),
  },
  {
    name: "a disabled single field",
    element: (
      <FieldForm
        name="fruit"
        label="Fruit"
        disabled
        options={fruits}
        value="apple"
      />
    ),
  },
  {
    name: "a disabled multiple field with chips",
    element: (
      <FieldForm
        name="fruits"
        label="Fruits"
        isMultiple
        disabled
        options={fruits}
        value={["apple", "banana"]}
      />
    ),
  },
  {
    name: "a single field whose value lookup is pending",
    element: (
      <FieldForm
        name="fruit"
        label="Fruit"
        options={fruits}
        value="apple"
        convertValueToItem={pendingLookup}
      />
    ),
  },
  {
    name: "a multiple field whose value lookups are pending",
    element: (
      <FieldForm
        name="fruits"
        label="Fruits"
        isMultiple
        options={fruits}
        value={["apple", "banana"]}
        convertValueToItem={pendingLookup}
      />
    ),
  },
];

describe("ComboboxInput accessibility checks", () => {
  it.each(states)(
    "has no axe violation as $name",
    async ({ element, drive }) => {
      const { container } = render(element);
      drive?.();
      await expectNoAxeViolations(container);
    },
  );
});
