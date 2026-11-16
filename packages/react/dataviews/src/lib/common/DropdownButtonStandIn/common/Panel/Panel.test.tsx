import { assertInvariant } from "@canonical/dataviews-core/bindings";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { type ReactNode, useLayoutEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { installPopoverStandIn } from "../../../../../../testing/index.js";
import { Menu } from "../Menu/index.js";
import type { PanelState } from "./hooks/index.js";
import { usePanelState } from "./hooks/index.js";
import Panel from "./Panel.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

/** Lets the queued toggle events reach React. */
const flushToggles = () => act(async () => {});

/** Shows the open state the panel records. */
const OpenState = ({ panel }: { panel: PanelState }) => (
  <output data-testid="open">{String(panel.isOpen)}</output>
);

/** A trigger and a panel sharing one state, as the HOC wires them. */
const Harness = ({
  triggerId = "trigger",
  content = (panel) => <OpenState panel={panel} />,
}: {
  triggerId?: string;
  content?: (panel: PanelState) => ReactNode;
}) => {
  const panel = usePanelState({
    panelId: "panel",
    triggerId,
    anchorName: "--panel",
  });
  return (
    <>
      <button type="button" id="trigger" popoverTarget="panel">
        Trigger
      </button>
      <Panel panel={panel}>{content(panel)}</Panel>
      <button type="button" onClick={panel.hide}>
        Hide
      </button>
    </>
  );
};

const renderPanel = (props: Parameters<typeof Harness>[0] = {}) => {
  const result = render(<Harness {...props} />);
  const panel = assertInvariant(
    document.getElementById("panel"),
    "the element renders",
  );
  const trigger = screen.getByText("Trigger");
  return { ...result, panel, trigger };
};

/** Content with one focusable item. */
const item = () => <a href="#inside">Inside</a>;

describe("Panel", () => {
  describe("markup", () => {
    it("is an auto popover anchored to its trigger, with no role", () => {
      const { panel } = renderPanel();
      expect(panel).toHaveAttribute("popover", "auto");
      expect(panel).toHaveAttribute("tabindex", "-1");
      expect(panel.className).toBe("ds dropdown-button-panel surface");
      expect(panel.style.getPropertyValue("position-anchor")).toBe("--panel");
      expect(panel).not.toHaveAttribute("role");
    });
  });

  describe("the open state", () => {
    const ways: [string, (parts: ReturnType<typeof renderPanel>) => void][] = [
      ["Escape", ({ panel }) => fireEvent.keyDown(panel, { key: "Escape" })],
      ["a click outside", () => fireEvent.pointerUp(document.body)],
      ["the trigger", ({ trigger }) => fireEvent.click(trigger)],
      ["hide()", () => fireEvent.click(screen.getByText("Hide"))],
    ];

    it.each(ways)("follows the popover closing on %s", async (_way, close) => {
      const parts = renderPanel();
      fireEvent.click(parts.trigger);
      await flushToggles();
      expect(screen.getByTestId("open")).toHaveTextContent("true");
      act(() => close(parts));
      await flushToggles();
      expect(screen.getByTestId("open")).toHaveTextContent("false");
    });
  });

  describe("focus", () => {
    it("returns to the trigger when it closes with focus inside", async () => {
      const { panel, trigger } = renderPanel({ content: item });
      fireEvent.click(trigger);
      await flushToggles();
      act(() => screen.getByText("Inside").focus());
      act(() => panel.hidePopover());
      await flushToggles();
      expect(trigger).toHaveFocus();
    });

    it("stays where it is when it closes with focus outside", async () => {
      const { panel, trigger } = renderPanel({ content: item });
      const hide = screen.getByText("Hide");
      fireEvent.click(trigger);
      await flushToggles();
      act(() => hide.focus());
      act(() => panel.hidePopover());
      await flushToggles();
      expect(hide).toHaveFocus();
    });

    it("moves back out inside a shadow root", async () => {
      const host = document.createElement("div");
      document.body.append(host);
      const shadow = host.attachShadow({ mode: "open" });
      const container = document.createElement("div");
      shadow.append(container);
      const { unmount } = render(<Harness content={item} />, { container });
      const panel = assertInvariant(
        shadow.getElementById("panel"),
        "the element renders",
      );
      act(() => panel.showPopover());
      await flushToggles();
      act(() =>
        assertInvariant(
          shadow.querySelector("a"),
          "the element renders",
        ).focus(),
      );
      act(() => panel.hidePopover());
      await flushToggles();
      expect(shadow.activeElement?.textContent).toBe("Trigger");
      unmount();
      host.remove();
    });

    it("does not throw when its trigger is missing", async () => {
      const { panel } = renderPanel({ triggerId: "gone", content: item });
      act(() => panel.showPopover());
      await flushToggles();
      act(() => screen.getByText("Inside").focus());
      act(() => panel.hidePopover());
      await expect(flushToggles()).resolves.toBeUndefined();
    });

    it("resets the menu's focus intent when it closes", async () => {
      const { panel } = renderPanel({
        content: (state) => (
          <output data-testid="intent">{String(state.focusIntent)}</output>
        ),
      });
      act(() => panel.showPopover());
      await flushToggles();
      act(() => screen.getByText("Hide").click());
      await flushToggles();
      expect(screen.getByTestId("intent")).toHaveTextContent("first");
    });
  });

  describe("state the toggle event missed", () => {
    /** Server-renders `ui`, opens the panel and focuses `focus`, then hydrates. */
    const hydrateOpen = async (ui: ReactNode, focus?: () => HTMLElement) => {
      const container = document.createElement("div");
      container.innerHTML = renderToString(ui);
      document.body.append(container);
      fireEvent.click(screen.getByText("Trigger"));
      // Let the stand-in's queued toggle fire before React listens.
      await Promise.resolve();
      if (focus) act(() => focus().focus());
      const onRecoverableError = vi.fn();
      const root = await act(async () =>
        hydrateRoot(container, ui, { onRecoverableError }),
      );
      expect(onRecoverableError).not.toHaveBeenCalled();
      return { container, root };
    };

    it("reads a popover opened before hydration", async () => {
      const { container, root } = await hydrateOpen(<Harness />);
      expect(screen.getByTestId("open")).toHaveTextContent("true");
      act(() => root.unmount());
      container.remove();
    });

    it("keeps focus on the item that had it, though a re-render replaces it", async () => {
      // An item whose key changes as it mounts, so the first re-render after
      // hydration replaces the element that had focus.
      const LinksMenu = ({ panel }: { panel: PanelState }) => {
        const [isLaidOut, setLaidOut] = useState(false);
        useLayoutEffect(() => setLaidOut(true), []);
        return (
          <Menu
            panel={panel}
            items={[
              { url: "#docs", label: "Docs" },
              {
                key: isLaidOut ? "blog-client" : "blog",
                url: "#blog",
                label: "Blog",
              },
            ]}
          />
        );
      };
      const { container, root } = await hydrateOpen(
        <Harness content={(panel) => <LinksMenu panel={panel} />} />,
        () =>
          assertInvariant(
            screen.getByText("Blog").closest("a"),
            "the element renders",
          ),
      );
      await waitFor(() =>
        expect(screen.getByRole("menuitem", { name: "Blog" })).toHaveFocus(),
      );
      act(() => root.unmount());
      container.remove();
    });

    it("re-reads the state on pageshow while open", async () => {
      const { panel, trigger } = renderPanel();
      fireEvent.click(trigger);
      await flushToggles();
      // A close the panel never heard of, as a cache restore can leave.
      const swallow = (event: Event) => event.stopPropagation();
      window.addEventListener("toggle", swallow, true);
      panel.hidePopover();
      await Promise.resolve();
      window.removeEventListener("toggle", swallow, true);
      expect(screen.getByTestId("open")).toHaveTextContent("true");
      act(() => {
        window.dispatchEvent(new Event("pageshow"));
      });
      expect(screen.getByTestId("open")).toHaveTextContent("false");
    });

    it("adds no window listener while closed, and removes it on close", async () => {
      const add = vi.spyOn(window, "addEventListener");
      const remove = vi.spyOn(window, "removeEventListener");
      const { trigger } = renderPanel();
      expect(add).not.toHaveBeenCalledWith("pageshow", expect.anything());
      fireEvent.click(trigger);
      await flushToggles();
      expect(add).toHaveBeenCalledWith("pageshow", expect.any(Function));
      fireEvent.click(trigger);
      await flushToggles();
      expect(remove).toHaveBeenCalledWith("pageshow", expect.any(Function));
      add.mockRestore();
      remove.mockRestore();
    });
  });
});
