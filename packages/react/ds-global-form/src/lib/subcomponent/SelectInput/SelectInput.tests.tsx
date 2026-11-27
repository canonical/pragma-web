import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { SelectInput } from "./SelectInput.js";

const options = [
  { label: "Red", value: "red" },
  { label: "Blue", value: "blue" },
  { label: "Green", value: "green" },
];

// These tests render the presentational input with NO FormProvider, proving it
// is usable standalone (outside of a <Form>).
describe("SelectInput (presentational)", () => {
  it("renders a select without a form context", () => {
    render(<SelectInput name="color" options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("applies the input chrome on the wrapping element", () => {
    render(<SelectInput name="color" options={options} />);
    expect(screen.getByRole("combobox").parentElement).toHaveClass(
      "ds",
      "input",
      "select",
      "chrome",
    );
  });

  it("overlays the chevron icon on a single select", () => {
    const { container } = render(
      <SelectInput name="color" options={options} />,
    );
    const chevron = container.querySelector("svg.chevron");
    expect(chevron).toBeInTheDocument();
    // Decorative: the select's accessible name comes from the Field label.
    expect(chevron).toHaveAttribute("aria-hidden", "true");
  });

  it("omits the chevron on a multiple select", () => {
    const { container } = render(
      <SelectInput name="colors" options={options} multiple />,
    );
    expect(container.querySelector("svg.chevron")).not.toBeInTheDocument();
  });

  it("renders all options", () => {
    render(<SelectInput name="color" options={options} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("supports disabled options", () => {
    const opts = [
      ...options,
      { label: "Disabled", value: "disabled", disabled: true },
    ];
    render(<SelectInput name="color" options={opts} />);
    expect(screen.getByRole("option", { name: "Disabled" })).toBeDisabled();
  });

  it("sets an option's lang when the option names one", () => {
    const languages = [
      { label: "English", value: "en", lang: "en" },
      { label: "français", value: "fr", lang: "fr" },
    ];
    render(<SelectInput name="locale" options={languages} />);
    expect(screen.getByRole("option", { name: "français" })).toHaveAttribute(
      "lang",
      "fr",
    );
  });

  it("leaves lang off options that name none", () => {
    render(<SelectInput name="color" options={options} />);
    expect(screen.getByRole("option", { name: "Red" })).not.toHaveAttribute(
      "lang",
    );
  });

  it("is controllable via value/onChange", () => {
    const onChange = vi.fn();
    render(
      <SelectInput
        name="color"
        options={options}
        value="blue"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("blue");
  });

  it("forwards a ref to the underlying select", () => {
    const ref = createRef<HTMLSelectElement>();
    render(<SelectInput name="color" options={options} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("supports the disabled state", () => {
    render(<SelectInput name="color" options={options} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
