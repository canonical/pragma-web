/**
 * One step of "Add filter" as a listbox: focus moves between options
 * without choosing, and Enter, Space or a click chooses one.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { QueryInputOption } from "../../../../../../../../../component/QueryInput/index.js";
import StepListbox from "./StepListbox.js";

/** The fields of a step, one held and one disabled. */
const OPTIONS: readonly QueryInputOption[] = [
  { id: "status", label: "status", hint: "12 machines" },
  { id: "pool", label: "pool", current: true },
  { id: "zone", label: "zone", disabled: true },
  { id: "cores", label: "cores", name: "CPU cores" },
];

const mount = (props: Partial<Parameters<typeof StepListbox>[0]> = {}) => {
  const onChoose = vi.fn();
  const view = render(
    <StepListbox
      label="Choose a field"
      options={OPTIONS}
      emptyText="No matches"
      selected={new Set()}
      onChoose={onChoose}
      {...props}
    />,
  );
  return {
    onChoose,
    view,
    find: (name: string) => screen.getByRole("option", { name }),
  };
};

describe("StepListbox", () => {
  it("is a listbox named by its step, focus on its first option", () => {
    const { view, find } = mount({ className: "extra" });
    const listbox = screen.getByRole("listbox", { name: "Choose a field" });
    expect(listbox).toHaveClass(
      "ds",
      "data-views-query-bar-step-listbox",
      "extra",
    );
    expect(listbox).not.toHaveAttribute("aria-multiselectable");
    expect(find("status, 12 machines")).toHaveFocus();
    expect(find("status, 12 machines")).toHaveAttribute("tabindex", "0");
    expect(find("pool")).toHaveAttribute("tabindex", "-1");
    expect(find("pool")).toHaveAttribute("aria-disabled", "true");
    expect(find("zone")).toHaveAttribute("aria-disabled", "true");
    expect(find("CPU cores")).not.toHaveAttribute("aria-disabled");
    // One: no option says it is chosen until one is.
    expect(view.container.querySelectorAll("[aria-selected]")).toHaveLength(0);
    expect(view.container.querySelector(".mark")).toBeNull();
  });

  it("moves focus with Up, Down, Home and End, choosing nothing", () => {
    const { onChoose, find } = mount();
    fireEvent.keyDown(find("status, 12 machines"), { key: "ArrowUp" });
    expect(find("status, 12 machines")).toHaveFocus();
    fireEvent.keyDown(find("status, 12 machines"), { key: "ArrowDown" });
    expect(find("pool")).toHaveFocus();
    expect(find("pool")).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(find("pool"), { key: "End" });
    expect(find("CPU cores")).toHaveFocus();
    fireEvent.keyDown(find("CPU cores"), { key: "ArrowDown" });
    expect(find("CPU cores")).toHaveFocus();
    fireEvent.keyDown(find("CPU cores"), { key: "Home" });
    expect(find("status, 12 machines")).toHaveFocus();
    expect(fireEvent.keyDown(find("status, 12 machines"), { key: "a" })).toBe(
      true,
    );
    expect(onChoose).not.toHaveBeenCalled();
  });

  it("chooses by Enter, Space or a click, never a disabled or held option", () => {
    const { onChoose, find } = mount();
    expect(
      fireEvent.keyDown(find("status, 12 machines"), { key: "Enter" }),
    ).toBe(false);
    fireEvent.keyDown(find("CPU cores"), { key: " " });
    fireEvent.click(find("status, 12 machines"));
    fireEvent.click(find("pool"));
    fireEvent.keyDown(find("zone"), { key: "Enter" });
    expect(onChoose.mock.calls.map(([option]) => option.id)).toEqual([
      "status",
      "cores",
      "status",
    ]);
    fireEvent.focus(find("zone"));
    expect(find("zone")).toHaveAttribute("tabindex", "0");
  });

  it("marks the option chosen, and starts on it", () => {
    const { find } = mount({ selected: new Set(["cores"]) });
    expect(find("CPU cores")).toHaveAttribute("aria-selected", "true");
    expect(find("CPU cores")).toHaveFocus();
    expect(find("status, 12 machines")).not.toHaveAttribute("aria-selected");
  });

  it("with several, is multiselectable, every option saying whether it is chosen", () => {
    const { view, find } = mount({
      multiple: true,
      selected: new Set(["status"]),
    });
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-multiselectable",
      "true",
    );
    expect(find("status, 12 machines")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(find("CPU cores")).toHaveAttribute("aria-selected", "false");
    expect(view.container.querySelectorAll(".mark")).toHaveLength(4);
  });

  it("with no option, holds the stop itself and says why", () => {
    mount({ options: [] });
    const listbox = screen.getByRole("listbox", { name: "Choose a field" });
    expect(listbox).toHaveFocus();
    expect(listbox).toHaveAttribute("tabindex", "0");
    expect(listbox).toHaveAccessibleDescription("No matches");
  });

  it("keeps the stop on an option there is as the options shrink", () => {
    const { find, view } = mount();
    fireEvent.keyDown(find("status, 12 machines"), { key: "End" });
    view.rerender(
      <StepListbox
        label="Choose a field"
        options={OPTIONS.slice(0, 2)}
        emptyText="No matches"
        selected={new Set()}
        onChoose={() => {}}
      />,
    );
    expect(find("pool")).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("listbox")).not.toHaveAttribute("tabindex");
  });

  it("moves focus to the option at the stop as options land on an empty step", () => {
    const { view } = mount({ options: [] });
    expect(screen.getByRole("listbox")).toHaveFocus();
    view.rerender(
      <StepListbox
        label="Choose a field"
        options={OPTIONS}
        emptyText="No matches"
        selected={new Set()}
        onChoose={() => {}}
      />,
    );
    expect(
      screen.getByRole("option", { name: "status, 12 machines" }),
    ).toHaveFocus();
  });

  it("gives focus back to the stop when the focused option leaves", () => {
    const { view, find } = mount();
    fireEvent.keyDown(find("status, 12 machines"), { key: "End" });
    expect(find("CPU cores")).toHaveFocus();
    find("CPU cores").blur();
    view.rerender(
      <StepListbox
        label="Choose a field"
        options={OPTIONS.slice(0, 2)}
        emptyText="No matches"
        selected={new Set()}
        onChoose={() => {}}
      />,
    );
    expect(find("pool")).toHaveFocus();
  });

  it("leaves focus that went elsewhere where it went", () => {
    const { view, find } = mount({ onFocus: () => {}, onBlur: () => {} });
    const elsewhere = document.createElement("button");
    document.body.append(elsewhere);
    fireEvent.blur(find("status, 12 machines"), { relatedTarget: elsewhere });
    fireEvent.blur(find("status, 12 machines"), {
      relatedTarget: find("pool"),
    });
    fireEvent.blur(find("status, 12 machines"), { relatedTarget: elsewhere });
    elsewhere.focus();
    view.rerender(
      <StepListbox
        label="Choose a field"
        options={OPTIONS.slice(1)}
        emptyText="No matches"
        selected={new Set()}
        onChoose={() => {}}
      />,
    );
    expect(elsewhere).toHaveFocus();
    elsewhere.remove();
  });
});
