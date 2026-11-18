import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NameForm from "./NameForm.js";

/** The form over the given answers. */
const mountForm = ({
  initial = "",
  pending = false,
  onSubmit = vi.fn(async (_name: string): Promise<string | null> => null),
  onCancel = vi.fn(),
} = {}) => {
  render(
    <NameForm
      label="Save as a new view"
      submit="Save view"
      nameLabel="Name"
      cancel="Cancel"
      initial={initial}
      pending={pending}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />,
  );
  return { onSubmit, onCancel };
};

/** Submit the form through its submit button, letting the answer settle. */
const submitForm = async (): Promise<void> => {
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Save view" }));
  });
};

describe("NameForm", () => {
  it("is a named form that takes the focus on its input", () => {
    mountForm({ initial: "Failed" });
    expect(
      screen.getByRole("form", { name: "Save as a new view" }),
    ).toHaveClass("ds", "data-views-saved-views-name-form");
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveValue("Failed");
    expect(input).toHaveFocus();
    expect(input).toBeRequired();
  });

  it("submits the name as edited", async () => {
    const { onSubmit } = mountForm();
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Busy" },
    });
    await submitForm();
    expect(onSubmit).toHaveBeenCalledWith("Busy");
    expect(screen.queryByText("Taken")).toBeNull();
  });

  it("shows a refusal as the input's validity, and takes the focus back", async () => {
    const onSubmit = vi.fn(async (): Promise<string | null> => "Taken");
    mountForm({ initial: "Failed", onSubmit });
    const input = screen.getByRole("textbox", { name: "Name" });
    screen.getByRole("button", { name: "Cancel" }).focus();
    await submitForm();
    expect(input).toHaveAccessibleDescription("Taken");
    expect(input).toBeInvalid();
    expect(input).toHaveFocus();
  });

  it("clears a refusal as the name is edited", async () => {
    const onSubmit = vi.fn(async (): Promise<string | null> => "Taken");
    mountForm({ initial: "Failed", onSubmit });
    await submitForm();
    const input = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(input, { target: { value: "Failed again" } });
    expect(screen.queryByText("Taken")).toBeNull();
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).toBeValid();
  });

  it("asks anew when submitted again after a refusal", async () => {
    const onSubmit = vi
      .fn<(name: string) => Promise<string | null>>()
      .mockResolvedValueOnce("Taken")
      .mockResolvedValueOnce(null);
    mountForm({ initial: "Failed", onSubmit });
    await submitForm();
    await submitForm();
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeValid();
  });

  it("cancels on Cancel, and on Escape alone", () => {
    const { onCancel } = mountForm();
    const form = screen.getByRole("form");
    fireEvent.keyDown(form, { key: "a" });
    expect(onCancel).not.toHaveBeenCalled();
    expect(fireEvent.keyDown(form, { key: "Escape" })).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("disables the submit while pending", () => {
    mountForm({ pending: true });
    expect(screen.getByRole("button", { name: "Save view" })).toBeDisabled();
  });
});
