import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import installPopoverStandIn from "../../../../testing/installPopoverStandIn.js";
import DropdownPanelStandIn from "./DropdownPanelStandIn.js";
import type { DropdownPanelHandle } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const flushToggle = () => act(() => Promise.resolve());

describe("DropdownPanelStandIn", () => {
  it("renders an auto popover on a raised surface, with no role before hydration", () => {
    const html = renderToString(
      <DropdownPanelStandIn ref={createRef()} id="panel" aria-label="Status">
        Options
      </DropdownPanelStandIn>,
    );
    expect(html).toContain('popover="auto"');
    expect(html).toContain('class="ds dropdown-button-panel surface"');
    expect(html).not.toContain("role=");
  });

  it("is a dialog named by its label once hydrated, and merges classes", () => {
    render(
      <DropdownPanelStandIn
        ref={createRef()}
        id="panel"
        aria-label="Status"
        className="extra"
      >
        Options
      </DropdownPanelStandIn>,
    );
    const panel = document.getElementById("panel") as HTMLElement;
    expect(panel).toHaveAttribute("role", "dialog");
    expect(panel).toHaveAttribute("aria-label", "Status");
    expect(panel).toHaveClass(
      "ds",
      "dropdown-button-panel",
      "surface",
      "extra",
    );
  });

  it("keeps the browser's placement and its own style without a trigger", () => {
    render(
      <DropdownPanelStandIn
        ref={createRef()}
        id="panel"
        aria-label="Status"
        style={{ color: "red" }}
      >
        Options
      </DropdownPanelStandIn>,
    );
    const panel = document.getElementById("panel") as HTMLElement;
    expect(panel).not.toHaveClass("anchored");
    expect(panel.style.color).toBe("red");
  });

  it("drives the popover through its handle", async () => {
    const ref = createRef<DropdownPanelHandle>();
    render(
      <DropdownPanelStandIn ref={ref} id="panel" aria-label="Status">
        Options
      </DropdownPanelStandIn>,
    );
    const panel = document.getElementById("panel") as HTMLElement;
    expect(ref.current?.element).toBe(panel);
    act(() => ref.current?.show());
    act(() => ref.current?.show());
    expect(panel.matches(":popover-open")).toBe(true);
    act(() => ref.current?.hide());
    act(() => ref.current?.hide());
    expect(panel.matches(":popover-open")).toBe(false);
    act(() => ref.current?.toggle());
    expect(panel.matches(":popover-open")).toBe(true);
    act(() => ref.current?.toggle());
    await flushToggle();
    expect(panel.matches(":popover-open")).toBe(false);
  });

  it("runs onToggle and focuses its first control when it opens", async () => {
    const onToggle = vi.fn();
    const ref = createRef<DropdownPanelHandle>();
    render(
      <DropdownPanelStandIn
        ref={ref}
        id="panel"
        aria-label="Status"
        onToggle={onToggle}
      >
        <input type="checkbox" aria-label="Deployed" />
      </DropdownPanelStandIn>,
    );
    act(() => ref.current?.show());
    await flushToggle();
    expect(onToggle).toHaveBeenCalledWith(
      expect.objectContaining({ newState: "open" }),
    );
    expect(screen.getByRole("checkbox", { hidden: true })).toHaveFocus();
  });

  it("skips hidden, inert and refused controls when it opens", async () => {
    const ref = createRef<DropdownPanelHandle>();
    render(
      <DropdownPanelStandIn ref={ref} id="panel" aria-label="Status">
        <input type="hidden" name="page" value="1" />
        <div hidden>
          <input aria-label="Hidden" />
        </div>
        <div inert>
          <input aria-label="Inert" />
        </div>
        <fieldset disabled>
          <input aria-label="Refused" />
        </fieldset>
        <input type="checkbox" aria-label="Deployed" />
      </DropdownPanelStandIn>,
    );
    act(() => ref.current?.show());
    await flushToggle();
    expect(screen.getByRole("checkbox", { hidden: true })).toHaveFocus();
  });

  it("ignores the toggles of a popover nested in it", async () => {
    const onToggle = vi.fn();
    const ref = createRef<DropdownPanelHandle>();
    render(
      <DropdownPanelStandIn
        ref={ref}
        id="panel"
        aria-label="Status"
        onToggle={onToggle}
      >
        <div id="nested" popover="manual">
          <button type="button">Nested</button>
        </div>
      </DropdownPanelStandIn>,
    );
    const nested = document.getElementById("nested") as HTMLElement;
    act(() => {
      nested.dispatchEvent(
        new ToggleEvent("beforetoggle", { newState: "closed", bubbles: true }),
      );
      nested.dispatchEvent(
        new ToggleEvent("toggle", { newState: "open", bubbles: true }),
      );
    });
    // The panel's own listener ignores it: focus does not move in.
    expect(onToggle).toHaveBeenCalled();
    expect(screen.getByRole("button", { hidden: true })).not.toHaveFocus();
    expect(document.getElementById("panel")).not.toHaveFocus();
  });

  it("focuses itself when it holds no control", async () => {
    const ref = createRef<DropdownPanelHandle>();
    render(
      <DropdownPanelStandIn ref={ref} id="panel" aria-label="Status">
        Nothing to choose
      </DropdownPanelStandIn>,
    );
    act(() => ref.current?.show());
    await flushToggle();
    expect(document.getElementById("panel")).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    await flushToggle();
    expect(ref.current?.element?.matches(":popover-open")).toBe(false);
  });
});
