import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import installPopoverStandIn from "../../../../../../testing/installPopoverStandIn.js";
import type { FilterButtonPanelHandle } from "../../types.js";
import Panel from "./Panel.js";
import type { PanelProps } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const flushToggle = () => act(() => Promise.resolve());

const renderPanel = (
  children: ReactNode,
  props: Partial<PanelProps> = {},
): FilterButtonPanelHandle => {
  const handleRef = createRef<FilterButtonPanelHandle>();
  render(
    <>
      <button type="button" id="trigger">
        Status
      </button>
      <Panel
        id="panel"
        triggerId="trigger"
        anchorName="--panel"
        onOpenChange={() => {}}
        handleRef={handleRef}
        {...props}
      >
        {children}
      </Panel>
    </>,
  );
  return handleRef.current as FilterButtonPanelHandle;
};

const readPanel = () => document.getElementById("panel") as HTMLElement;

describe("Panel", () => {
  it("renders an auto popover on a raised surface, with no dialog role before hydration", () => {
    const html = renderToString(
      <Panel
        id="panel"
        triggerId="trigger"
        anchorName="--panel"
        onOpenChange={() => {}}
      >
        Options
      </Panel>,
    );
    expect(html).toContain('popover="auto"');
    expect(html).toContain('class="ds filter-button-panel surface"');
    expect(html).not.toContain("role=");
    expect(html).not.toContain("aria-labelledby");
  });

  it("is a dialog named by the trigger once hydrated, placed by its anchor", () => {
    renderPanel("Options");
    const panel = readPanel();
    expect(panel).toHaveAttribute("role", "dialog");
    expect(panel).toHaveAttribute("aria-labelledby", "trigger");
    expect(panel).toHaveTextContent("Options");
    expect(panel.style.getPropertyValue("position-anchor")).toBe("--panel");
  });

  it("drives the popover through its handle", async () => {
    const handle = renderPanel("Options");
    expect(handle.element).toBe(readPanel());
    act(() => handle.show());
    act(() => handle.show());
    expect(readPanel().matches(":popover-open")).toBe(true);
    act(() => handle.hide());
    act(() => handle.hide());
    expect(readPanel().matches(":popover-open")).toBe(false);
    act(() => handle.toggle());
    expect(readPanel().matches(":popover-open")).toBe(true);
    act(() => handle.toggle());
    await flushToggle();
    expect(readPanel().matches(":popover-open")).toBe(false);
  });

  it("gives a callback handleRef its handle, and null when it unmounts", () => {
    const handleRef = vi.fn();
    const { unmount } = render(
      <Panel
        id="panel"
        triggerId="trigger"
        anchorName="--panel"
        onOpenChange={() => {}}
        handleRef={handleRef}
      >
        Options
      </Panel>,
    );
    expect(handleRef).toHaveBeenCalledWith(
      expect.objectContaining({ element: readPanel() }),
    );
    unmount();
    expect(handleRef).toHaveBeenLastCalledWith(null);
  });

  it("reports its state, runs onToggle and focuses its first control when it opens", async () => {
    const onToggle = vi.fn();
    const onOpenChange = vi.fn();
    const handle = renderPanel(
      <input type="checkbox" aria-label="Deployed" />,
      { onToggle, onOpenChange },
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    act(() => handle.show());
    await flushToggle();
    expect(onToggle).toHaveBeenCalledWith(
      expect.objectContaining({ newState: "open" }),
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("checkbox", { hidden: true })).toHaveFocus();
  });

  it("skips hidden, inert and refused controls when it opens", async () => {
    const handle = renderPanel(
      <>
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
      </>,
    );
    act(() => handle.show());
    await flushToggle();
    expect(screen.getByRole("checkbox", { hidden: true })).toHaveFocus();
  });

  it("focuses itself when it holds no control", async () => {
    const handle = renderPanel("Nothing to choose");
    act(() => handle.show());
    await flushToggle();
    expect(readPanel()).toHaveFocus();
  });

  it("gives focus back to the trigger when it closes with focus inside", async () => {
    const handle = renderPanel(<input type="checkbox" aria-label="Deployed" />);
    act(() => handle.show());
    await flushToggle();
    fireEvent.keyDown(document, { key: "Escape" });
    await flushToggle();
    expect(document.getElementById("trigger")).toHaveFocus();
  });

  it("leaves focus where it is when it closes with focus outside", async () => {
    const handle = renderPanel(<input type="checkbox" aria-label="Deployed" />);
    act(() => handle.show());
    await flushToggle();
    const outside = document.getElementById("trigger") as HTMLElement;
    act(() => outside.focus());
    act(() => handle.hide());
    await flushToggle();
    expect(outside).toHaveFocus();
    expect(readPanel().matches(":popover-open")).toBe(false);
  });

  it("ignores the toggles of a popover nested in it", () => {
    const onToggle = vi.fn();
    const onOpenChange = vi.fn();
    renderPanel(
      <div id="nested" popover="manual">
        <button type="button">Nested</button>
      </div>,
      { onToggle, onOpenChange },
    );
    onOpenChange.mockClear();
    const nested = document.getElementById("nested") as HTMLElement;
    act(() => {
      nested.dispatchEvent(
        new ToggleEvent("beforetoggle", { newState: "closed", bubbles: true }),
      );
      nested.dispatchEvent(
        new ToggleEvent("toggle", { newState: "open", bubbles: true }),
      );
    });
    expect(onToggle).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { hidden: true, name: "Nested" }),
    ).not.toHaveFocus();
  });

  it("reads a popover opened before it hydrated, and leaves focus where the reader is", () => {
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, "matches").mockImplementation(function (
      this: Element,
      selector: string,
    ) {
      return selector === ":popover-open" || matches.call(this, selector);
    });
    const onOpenChange = vi.fn();
    renderPanel(<input type="checkbox" aria-label="Deployed" />, {
      onOpenChange,
    });
    vi.restoreAllMocks();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("checkbox", { hidden: true })).not.toHaveFocus();
    expect(document.activeElement).toBe(document.body);
  });
});
