import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import type { DropdownPanelHandle } from "../../../../common/withDropdownButtonStandIn/index.js";
import Context from "../Context.js";
import Panel from "./Panel.js";

describe("Panel", () => {
  it("refuses to render outside a FilterButton", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(<Panel ref={createRef()} id="panel" triggerId="trigger" />),
    ).toThrow("FilterButton's panel renders only inside FilterButton.");
    vi.restoreAllMocks();
  });

  it("is named by the trigger and holds the content", () => {
    render(
      <Context.Provider value={{ children: "Options" }}>
        <Panel ref={createRef()} id="panel" triggerId="trigger" />
      </Context.Provider>,
    );
    const panel = document.getElementById("panel");
    expect(panel).toHaveAttribute("aria-labelledby", "trigger");
    expect(panel).toHaveTextContent("Options");
  });

  it("gives its handle to the dropdown and to an object panelRef", () => {
    const ref = createRef<DropdownPanelHandle>();
    const panelRef = createRef<DropdownPanelHandle>();
    render(
      <Context.Provider value={{ children: "Options", panelRef }}>
        <Panel ref={ref} id="panel" triggerId="trigger" />
      </Context.Provider>,
    );
    expect(ref.current?.element).toBe(document.getElementById("panel"));
    expect(panelRef.current).toBe(ref.current);
  });

  it("gives its handle to a callback panelRef", () => {
    const ref = createRef<DropdownPanelHandle>();
    const panelRef = vi.fn();
    const { unmount } = render(
      <Context.Provider value={{ children: "Options", panelRef }}>
        <Panel ref={ref} id="panel" triggerId="trigger" />
      </Context.Provider>,
    );
    expect(panelRef).toHaveBeenCalledWith(ref.current);
    unmount();
    expect(panelRef).toHaveBeenLastCalledWith(null);
  });
});
