import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithForm } from "../../../testing/renderWithForm.js";
import { TextField } from "../../component/TextField/index.js";
import { Form } from "../../pattern/Form/index.js";
import type { Condition } from "../types.js";

// TextField is built with withWrapper, which applies withConditionalDisplay,
// so the HOC is exercised through a real field.

const isCompany: Condition = ({ role }) => role === "company";

describe("withConditionalDisplay", () => {
  it("always renders the field when there is no condition", () => {
    renderWithForm(<TextField name="company" label="Company" />);
    expect(screen.getByRole("textbox", { name: "Company" })).toBeVisible();
  });

  it("renders the field when the condition returns true", () => {
    renderWithForm(
      <TextField name="company" label="Company" condition={isCompany} />,
      { formProps: { defaultValues: { role: "company" } } },
    );
    expect(screen.getByRole("textbox", { name: "Company" })).toBeVisible();
  });

  it("does not render the field when the condition returns false", () => {
    renderWithForm(
      <TextField name="company" label="Company" condition={isCompany} />,
      { formProps: { defaultValues: { role: "individual" } } },
    );
    expect(
      screen.queryByRole("textbox", { name: "Company" }),
    ).not.toBeInTheDocument();
  });

  it("passes every form value to the condition", () => {
    const condition = vi.fn<Condition>(() => true);
    renderWithForm(
      <TextField name="company" label="Company" condition={condition} />,
      { formProps: { defaultValues: { role: "company", seats: 3 } } },
    );
    expect(condition).toHaveBeenCalledWith(
      expect.objectContaining({ role: "company", seats: 3 }),
    );
  });

  it("re-evaluates the condition when a watched value changes", async () => {
    renderWithForm(
      <>
        <TextField name="role" label="Role" />
        <TextField name="company" label="Company" condition={isCompany} />
      </>,
    );
    const role = screen.getByRole("textbox", { name: "Role" });
    expect(
      screen.queryByRole("textbox", { name: "Company" }),
    ).not.toBeInTheDocument();

    fireEvent.change(role, { target: { value: "company" } });
    expect(
      await screen.findByRole("textbox", { name: "Company" }),
    ).toBeVisible();

    fireEvent.change(role, { target: { value: "individual" } });
    await waitFor(() => {
      expect(
        screen.queryByRole("textbox", { name: "Company" }),
      ).not.toBeInTheDocument();
    });
  });

  it("uses the current values for a condition added after mount", () => {
    const { rerender } = renderWithForm(
      <>
        <TextField name="role" label="Role" />
        <TextField name="company" label="Company" />
      </>,
      { formProps: { defaultValues: { role: "company" } } },
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Role" }), {
      target: { value: "individual" },
    });
    rerender(
      <>
        <TextField name="role" label="Role" />
        <TextField name="company" label="Company" condition={isCompany} />
      </>,
    );
    expect(
      screen.queryByRole("textbox", { name: "Company" }),
    ).not.toBeInTheDocument();
  });

  it("does not submit a hidden field", async () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        <TextField name="role" label="Role" />
        <TextField name="company" label="Company" condition={isCompany} />
        <button type="submit">Submit</button>
      </Form>,
    );
    const role = screen.getByRole("textbox", { name: "Role" });
    fireEvent.change(role, { target: { value: "company" } });
    fireEvent.change(await screen.findByRole("textbox", { name: "Company" }), {
      target: { value: "Acme" },
    });
    fireEvent.change(role, { target: { value: "individual" } });
    await waitFor(() => {
      expect(
        screen.queryByRole("textbox", { name: "Company" }),
      ).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls.at(0)?.at(0)).toEqual({ role: "individual" });
  });

  it("does not pass the condition on to the field", () => {
    renderWithForm(
      <TextField name="company" label="Company" condition={() => true} />,
    );
    expect(
      screen.getByRole("textbox", { name: "Company" }),
    ).not.toHaveAttribute("condition");
  });
});
