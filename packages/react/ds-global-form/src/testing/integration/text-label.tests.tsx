import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { TextField } from "../../lib/component/TextField/index.js";

describe("Text field label", () => {
  it("associates the label with the input rather than its wrapper", () => {
    function App() {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <TextField name="email" label="Email" />
        </FormProvider>
      );
    }
    render(<App />);
    const input = screen.getByRole("textbox", { name: "Email" });
    const label = screen.getByText("Email").closest("label");
    if (!label) throw new Error("Missing label");
    expect(label.htmlFor).toBe(input.id);
    expect(document.getElementById(label.htmlFor)).toBe(input);
    expect(label.control).toBe(input);
  });
});
