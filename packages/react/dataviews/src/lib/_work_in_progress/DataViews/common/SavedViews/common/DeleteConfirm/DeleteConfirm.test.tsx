import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DeleteConfirm from "./DeleteConfirm.js";

/** The question over the given answers. */
const mountConfirm = ({
  pending = false,
  onSubmit = vi.fn(),
  onCancel = vi.fn(),
} = {}) => {
  render(
    <DeleteConfirm
      question="Delete “Failed”? This cannot be undone."
      submit="Delete view"
      cancel="Cancel"
      pending={pending}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />,
  );
  return { onSubmit, onCancel };
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
  it("groups its answers under the question", () => {
    mountConfirm();
    const group = screen.getByRole("group", {
      name: "Delete “Failed”? This cannot be undone.",
    });
    expect(group).toHaveClass("ds", "data-views-saved-views-confirm");
    expect(group).toContainElement(
      screen.getByRole("button", { name: "Delete view" }),
    );
  });

  it("starts the focus on Cancel", () => {
    mountConfirm();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("deletes on the destructive answer", () => {
    const { onSubmit, onCancel } = mountConfirm();
    fireEvent.click(screen.getByRole("button", { name: "Delete view" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("cancels on Cancel", () => {
    const { onSubmit, onCancel } = mountConfirm();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("cancels on Escape, and on no other key", () => {
    const { onCancel } = mountConfirm();
    const group = screen.getByRole("group");
    fireEvent.keyDown(group, { key: "Enter" });
    expect(onCancel).not.toHaveBeenCalled();
    const escaped = fireEvent.keyDown(group, { key: "Escape" });
    expect(escaped).toBe(false);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables the destructive answer while pending", () => {
    mountConfirm({ pending: true });
    expect(screen.getByRole("button", { name: "Delete view" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });
  it.fails("is a dialog named by its question, with the focus on Cancel as it opens", () => {
    mountConfirm();
    openDialog();
    expect(
      screen.getByRole("dialog", {
        name: "Delete “Failed”? This cannot be undone.",
      }),
    ).toHaveClass("ds", "data-views-saved-views-confirm");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it.fails("closes on Cancel and on Escape", () => {
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

  it.fails("takes its dialog's native props", () => {
    render(
      <DeleteConfirm
        question="Delete “Failed”? This cannot be undone."
        submit="Delete view"
        cancel="Cancel"
        pending={false}
        onSubmit={() => {}}
        // Typed for both shapes: the props before and after the dialog.
        {...({ id: "deleting", className: "extra", onCancel: () => {} } as {
          readonly onCancel: () => void;
        })}
      />,
    );
    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("id", "deleting");
    expect(dialog).toHaveClass("ds", "data-views-saved-views-confirm", "extra");
  });
});
