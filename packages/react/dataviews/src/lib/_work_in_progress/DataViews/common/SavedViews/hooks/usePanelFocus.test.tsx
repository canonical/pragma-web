import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import usePanelFocus from "./usePanelFocus.js";

/** The command and dialog the hook serves, as the saved views draw them. */
const Commands = ({
  pending = false,
  selectDisabled = false,
  saveDisabled = false,
  showSave = true,
}) => {
  const focus = usePanelFocus({ pending });
  return (
    // biome-ignore lint/a11y/useSemanticElements: the saved views group their parts as this div does
    <div
      role="group"
      aria-label="Saved views"
      onFocus={focus.recordFocus}
      onBlur={focus.recordBlur}
    >
      <select aria-label="View" ref={focus.select} disabled={selectDisabled}>
        <option>None</option>
      </select>
      <button ref={focus.retry} type="button">
        Try again
      </button>
      {showSave ? (
        <button
          type="button"
          disabled={saveDisabled}
          commandfor="names"
          command="show-modal"
          onClick={focus.recordOpener}
        >
          Save as
        </button>
      ) : null}
      <dialog id="names" aria-label="Name" onClose={focus.restoreFocus}>
        <button type="button" commandfor="names" command="close">
          Cancel
        </button>
      </dialog>
    </div>
  );
};

/** Click a button by its name, focusing it first as a pointer would. */
const pressButton = (name: string): void => {
  const button = screen.getByRole("button", { name });
  act(() => {
    button.focus();
  });
  fireEvent.click(button);
};

describe("usePanelFocus", () => {
  it("leaves the focus where the platform returns it as a dialog closes", () => {
    render(<Commands />);
    pressButton("Save as");
    expect(screen.getByRole("dialog", { name: "Name" })).toBeVisible();
    pressButton("Cancel");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "Save as" })).toHaveFocus();
  });

  it("returns the focus to the command the platform could not, once nothing is pending", () => {
    const { rerender } = render(<Commands pending />);
    pressButton("Save as");
    // The command is held while the dialog's command is in flight.
    rerender(<Commands pending saveDisabled />);
    pressButton("Cancel");
    const save = screen.getByRole("button", { name: "Save as" });
    expect(save).not.toHaveFocus();
    rerender(<Commands />);
    expect(save).toHaveFocus();
  });

  it("hands a focus stranded on a disabled control to the view select", () => {
    const { rerender } = render(<Commands />);
    act(() => {
      screen.getByRole("button", { name: "Save as" }).focus();
    });
    rerender(<Commands saveDisabled />);
    expect(screen.getByRole("combobox", { name: "View" })).toHaveFocus();
  });

  it("hands a focus stranded on a removed control to the view select", () => {
    const { rerender } = render(<Commands />);
    act(() => {
      screen.getByRole("button", { name: "Save as" }).focus();
    });
    rerender(<Commands showSave={false} />);
    expect(screen.getByRole("combobox", { name: "View" })).toHaveFocus();
  });

  it("hands a stranded focus to Try again while the select is disabled", () => {
    const { rerender } = render(<Commands />);
    act(() => {
      screen.getByRole("button", { name: "Save as" }).focus();
    });
    rerender(<Commands saveDisabled selectDisabled />);
    expect(screen.getByRole("button", { name: "Try again" })).toHaveFocus();
  });

  it("leaves a focus the user moved elsewhere", () => {
    const { rerender } = render(
      <>
        <Commands />
        <button type="button">Elsewhere</button>
      </>,
    );
    const save = screen.getByRole("button", { name: "Save as" });
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    act(() => {
      elsewhere.focus();
    });
    // Recorded as focused without the focus moving to it.
    fireEvent.focus(save);
    rerender(
      <>
        <Commands saveDisabled />
        <button type="button">Elsewhere</button>
      </>,
    );
    expect(elsewhere).toHaveFocus();
  });

  it("forgets a focus that left for another element", () => {
    const { rerender } = render(<Commands />);
    const save = screen.getByRole("button", { name: "Save as" });
    act(() => {
      save.focus();
    });
    fireEvent.blur(save, {
      relatedTarget: screen.getByRole("button", { name: "Try again" }),
    });
    rerender(<Commands saveDisabled />);
    expect(screen.getByRole("combobox", { name: "View" })).not.toHaveFocus();
  });

  it("keeps watching a focus that left for nowhere", () => {
    const { rerender } = render(<Commands />);
    const save = screen.getByRole("button", { name: "Save as" });
    act(() => {
      save.focus();
    });
    fireEvent.blur(save, { relatedTarget: null });
    rerender(<Commands saveDisabled />);
    expect(screen.getByRole("combobox", { name: "View" })).toHaveFocus();
  });
});
