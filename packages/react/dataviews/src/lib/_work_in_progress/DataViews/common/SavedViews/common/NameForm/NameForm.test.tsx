import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NameForm from "./NameForm.js";

/** The dialog over the given answers, closed. */
const mountForm = ({
  initial = "",
  pending = false,
  onSubmit = vi.fn(async (_name: string): Promise<string | null> => null),
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
    />,
  );
  return { onSubmit };
};

/** Open the one dialog rendered, as its command does. */
const openDialog = (): HTMLDialogElement => {
  const dialog = document.querySelector("dialog");
  if (dialog === null) {
    throw new Error("expected a dialog");
  }
  act(() => {
    dialog.showModal();
  });
  return dialog;
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
    openDialog();
    expect(
      screen.getByRole("form", { name: "Save as a new view" }),
    ).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveValue("Failed");
    expect(input).toHaveFocus();
    expect(input).toBeRequired();
  });

  it("submits the name as edited", async () => {
    const { onSubmit } = mountForm();
    openDialog();
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
    openDialog();
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
    openDialog();
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
    openDialog();
    await submitForm();
    await submitForm();
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeValid();
  });

  it("disables the submit while pending", () => {
    mountForm({ pending: true });
    openDialog();
    expect(screen.getByRole("button", { name: "Save view" })).toBeDisabled();
  });
  it("is a dialog named for what the name is for, focusing its input as it opens", () => {
    mountForm({ initial: "Failed" });
    openDialog();
    expect(
      screen.getByRole("dialog", { name: "Save as a new view" }),
    ).toHaveClass("ds", "data-views-saved-views-name-form");
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
  });

  it("refuses a name of only spaces natively", () => {
    mountForm();
    openDialog();
    const input = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Name",
    });
    fireEvent.change(input, { target: { value: "   " } });
    expect(input).toBeInvalid();
    expect(input.validity.patternMismatch).toBe(true);
  });

  it("closes on Cancel and on Escape, back to the name it started with", () => {
    mountForm({ initial: "Failed" });
    const dialog = openDialog();
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Busy" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(dialog.open).toBe(false);
    openDialog();
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Failed");
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Name" }), {
      key: "Escape",
    });
    expect(dialog.open).toBe(false);
  });

  it("takes its dialog's native props", () => {
    render(
      <NameForm
        id="names"
        className="extra"
        label="Save as a new view"
        submit="Save view"
        nameLabel="Name"
        cancel="Cancel"
        initial=""
        pending={false}
        onSubmit={async () => null}
      />,
    );
    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("id", "names");
    expect(dialog).toHaveClass(
      "ds",
      "data-views-saved-views-name-form",
      "extra",
    );
  });

  it("ignores a refusal that arrives after the dialog closed", async () => {
    let answer = (_refused: string | null): void => {};
    const onSubmit = vi.fn(
      (_name: string) =>
        new Promise<string | null>((resolve) => {
          answer = resolve;
        }),
    );
    mountForm({ initial: "Failed", onSubmit });
    const dialog = openDialog();
    await submitForm();
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Name" }), {
      key: "Escape",
    });
    expect(dialog.open).toBe(false);
    await act(async () => {
      answer("Taken");
    });
    openDialog();
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).toBeValid();
  });
});
