import { fireEvent, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { renderWithForm } from "../../../testing/renderWithForm.js";
import PhoneField from "./PhoneField.js";

/** Mirrors a slice of form state into the DOM so a test can assert on it. */
function TouchedProbe({ name }: { name: string }) {
  const { formState } = useFormContext();
  return (
    <output data-testid="touched">
      {String(Boolean(formState.touchedFields[name]))}
    </output>
  );
}

/** Calls `setFocus` once mounted, which only works if RHF holds the DOM node. */
function FocusOnMount({ name }: { name: string }) {
  const { setFocus } = useFormContext();
  useEffect(() => {
    setFocus(name);
  }, [setFocus, name]);
  return null;
}

describe("PhoneField", () => {
  it("renders the phone input with its label", () => {
    renderWithForm(<PhoneField name="phone" label="Phone" />);
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Phone" })).toBeInTheDocument();
  });

  it("points the label at the number input and keeps the country select labelled", () => {
    renderWithForm(<PhoneField name="phone" label="Phone" />);
    const number = screen.getByRole("textbox", { name: "Phone" });
    const label = screen.getByText("Phone").closest("label");
    expect(label).toHaveAttribute("for", number.id);
    expect(
      screen.getByRole("combobox", { name: "Country code" }),
    ).toHaveAttribute("name", "phone-country");
  });

  it("gives react-hook-form a real element, so setFocus reaches the input", async () => {
    // The binding hands `ref: field.ref` to the presentational input. While that
    // input ignored it, RHF's reference stayed the bare `{ name }` placeholder
    // with no `focus` method, so setFocus and focus-on-first-error both did
    // nothing at all for this field.
    renderWithForm(
      <>
        <PhoneField name="phone" label="Phone" />
        <FocusOnMount name="phone" />
      </>,
    );

    // RHF defers the focus call to a timeout, so this cannot be asserted
    // synchronously.
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Phone" })).toHaveFocus(),
    );
  });

  it("marks the field touched on blur", async () => {
    // The binding hands down `onBlur` alongside `value` and `ref`. While the
    // input ignored it the field was never touched, so `mode: "onTouched"` never
    // validated it and a touched-gated error could never appear.
    renderWithForm(
      <>
        <PhoneField name="phone" label="Phone" />
        <TouchedProbe name="phone" />
      </>,
      { formProps: { mode: "onTouched" } },
    );
    expect(screen.getByTestId("touched")).toHaveTextContent("false");

    fireEvent.blur(screen.getByRole("textbox", { name: "Phone" }));

    await waitFor(() =>
      expect(screen.getByTestId("touched")).toHaveTextContent("true"),
    );
  });
});
