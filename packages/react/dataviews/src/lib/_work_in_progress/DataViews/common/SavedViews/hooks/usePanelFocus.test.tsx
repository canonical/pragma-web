import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import usePanelFocus from "./usePanelFocus.js";

/** The commands and panel the hook serves, as the saved views draw them. */
const Commands = ({
  pending = false,
  hasView = true,
  selectDisabled = false,
  saveDisabled = false,
  showSave = true,
}) => {
  const focus = usePanelFocus({ pending, hasView });
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
          onClick={(event) => focus.openPanel("save-as", event.currentTarget)}
        >
          Save as
        </button>
      ) : null}
      <button
        type="button"
        onClick={(event) => focus.openPanel("rename", event.currentTarget)}
      >
        Rename
      </button>
      {focus.panel === null ? null : (
        <section aria-label={focus.panel}>
          <button type="button" onClick={focus.cancelPanel}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => focus.closePanel(focus.select.current)}
          >
            Done
          </button>
          <button type="button" onClick={() => focus.closePanel(null)}>
            Close
          </button>
        </section>
      )}
      <span>{focus.opener.current?.textContent ?? "no opener"}</span>
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
  it("opens a panel from its command, and cancels back to it", () => {
    const { rerender } = render(<Commands />);
    pressButton("Save as");
    expect(screen.getByRole("region", { name: "save-as" })).toBeVisible();
    rerender(<Commands />);
    expect(screen.getByText("Save as", { selector: "span" })).toBeVisible();
    pressButton("Cancel");
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.getByRole("button", { name: "Save as" })).toHaveFocus();
  });

  it("closes to the element it is given", () => {
    render(<Commands />);
    pressButton("Rename");
    pressButton("Done");
    expect(screen.getByRole("combobox", { name: "View" })).toHaveFocus();
  });

  it("closes to nowhere without taking the focus", () => {
    render(<Commands />);
    pressButton("Rename");
    const before = screen.getByRole("button", { name: "Close" });
    pressButton("Close");
    expect(before.isConnected).toBe(false);
    expect(screen.getByRole("button", { name: "Rename" })).not.toHaveFocus();
  });

  it("waits for nothing to be pending before it moves the focus", () => {
    const { rerender } = render(<Commands />);
    pressButton("Rename");
    rerender(<Commands pending />);
    pressButton("Cancel");
    expect(screen.getByRole("button", { name: "Rename" })).not.toHaveFocus();
    rerender(<Commands />);
    expect(screen.getByRole("button", { name: "Rename" })).toHaveFocus();
  });

  it("closes a rename panel with the view it was about", () => {
    const { rerender } = render(<Commands />);
    pressButton("Rename");
    rerender(<Commands hasView={false} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("keeps a save-as panel without a view", () => {
    const { rerender } = render(<Commands />);
    pressButton("Save as");
    rerender(<Commands hasView={false} />);
    expect(screen.getByRole("region", { name: "save-as" })).toBeVisible();
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
      relatedTarget: screen.getByRole("button", { name: "Rename" }),
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
