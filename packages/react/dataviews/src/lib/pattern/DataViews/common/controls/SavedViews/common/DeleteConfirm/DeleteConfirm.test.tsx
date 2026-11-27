import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DeleteConfirm from "./DeleteConfirm.js";

/** The question's dialog over the given answers, closed. */
const mountConfirm = ({ pending = false, onSubmit = vi.fn() } = {}) => {
  render(
    <DeleteConfirm
      question="Delete “Failed”? This cannot be undone."
      submit="Delete view"
      cancel="Cancel"
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

describe("DeleteConfirm", () => {
  it("deletes on the destructive answer, and only there", () => {
    const { onSubmit } = mountConfirm();
    const dialog = openDialog();
    fireEvent.keyDown(screen.getByRole("button", { name: "Cancel" }), {
      key: "Enter",
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(dialog.open).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Delete view" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("disables the destructive answer while pending", () => {
    mountConfirm({ pending: true });
    openDialog();
    expect(screen.getByRole("button", { name: "Delete view" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });
  it("is a dialog named by its question, with the focus on Cancel as it opens", () => {
    mountConfirm();
    openDialog();
    expect(
      screen.getByRole("dialog", {
        name: "Delete “Failed”? This cannot be undone.",
      }),
    ).toHaveClass("ds", "data-views-saved-views-confirm");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("closes on Cancel and on Escape", () => {
    mountConfirm();
    const dialog = openDialog();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(dialog.open).toBe(false);
    openDialog();
    fireEvent.keyDown(screen.getByRole("button", { name: "Cancel" }), {
      key: "Escape",
    });
    expect(dialog.open).toBe(false);
  });

  it("takes its dialog's native props", () => {
    render(
      <DeleteConfirm
        id="deleting"
        className="extra"
        question="Delete “Failed”? This cannot be undone."
        submit="Delete view"
        cancel="Cancel"
        pending={false}
        onSubmit={() => {}}
      />,
    );
    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("id", "deleting");
    expect(dialog).toHaveClass("ds", "data-views-saved-views-confirm", "extra");
  });
});
