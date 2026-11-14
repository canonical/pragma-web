import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import installPopoverStandIn from "../../../../../../testing/installPopoverStandIn.js";
import Menu from "../Menu/Menu.js";
import Context from "./Context.js";
import { usePanelContext } from "./hooks/index.js";
import type { PanelContextValue } from "./hooks/types.js";
import Component from "./Provider.js";
import type { DropdownPanelHandle } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

/** Lets the queued toggle events reach React. */
const flushToggles = () => act(async () => {});

/** Shows the open state the panel shares, from inside it. */
const OpenState = () => (
  <output data-testid="open">{String(usePanelContext()?.isOpen)}</output>
);

/** A hand-made trigger and a panel, composed directly. */
const renderPanel = (
  children: ReactNode = <OpenState />,
  props: Partial<Parameters<typeof Component>[0]> = {},
) => {
  const ref = createRef<DropdownPanelHandle>();
  const result = render(
    <>
      <button type="button" popoverTarget="panel">
        Trigger
      </button>
      <Component ref={ref} id="panel" aria-label="Options" {...props}>
        {children}
      </Component>
    </>,
  );
  const panel = document.getElementById("panel") as HTMLElement;
  const trigger = screen.getByText("Trigger");
  return { ...result, ref, panel, trigger };
};

/** The value a trigger's HOC provides around the panel. */
const createContextValue = (
  overrides: Partial<PanelContextValue> = {},
): PanelContextValue => ({
  panelId: "panel",
  triggerId: "trigger",
  anchorName: "--panel",
  isOpen: false,
  setOpen: vi.fn(),
  kind: "dialog",
  registerMenu: () => () => {},
  focusIntent: "first",
  setFocusIntent: vi.fn(),
  hide: vi.fn(),
  ...overrides,
});

describe("DropdownPanel", () => {
  describe("the handle", () => {
    it("shows, hides and toggles the popover", async () => {
      const { ref, panel } = renderPanel();
      act(() => ref.current?.show());
      expect(panel.matches(":popover-open")).toBe(true);
      act(() => ref.current?.hide());
      expect(panel.matches(":popover-open")).toBe(false);
      act(() => ref.current?.toggle());
      expect(panel.matches(":popover-open")).toBe(true);
      act(() => ref.current?.toggle());
      expect(panel.matches(":popover-open")).toBe(false);
      await flushToggles();
    });

    it("does nothing when asked for the state it is already in", async () => {
      const onBeforeToggle = vi.fn();
      const { ref } = renderPanel(null, { onBeforeToggle });
      act(() => ref.current?.hide());
      act(() => ref.current?.show());
      act(() => ref.current?.show());
      expect(onBeforeToggle).toHaveBeenCalledTimes(1);
      act(() => ref.current?.hide());
      await flushToggles();
    });

    it("exposes the popover element", () => {
      const { ref, panel } = renderPanel();
      expect(ref.current?.element).toBe(panel);
    });

    it("does nothing once the panel has unmounted", () => {
      const { ref, unmount } = renderPanel();
      const handle = ref.current as DropdownPanelHandle;
      unmount();
      expect(() => {
        handle.show();
        handle.hide();
        handle.toggle();
      }).not.toThrow();
      expect(handle.element).toBeNull();
    });
  });

  describe("onToggle and onBeforeToggle", () => {
    const ways: [string, (parts: ReturnType<typeof renderPanel>) => void][] = [
      ["Escape", ({ panel }) => fireEvent.keyDown(panel, { key: "Escape" })],
      [
        "a click outside",
        () => fireEvent.pointerUp(document.body, { bubbles: true }),
      ],
      ["the trigger", ({ trigger }) => fireEvent.click(trigger)],
      ["hide()", ({ ref }) => ref.current?.hide()],
    ];

    it.each(ways)(
      "runs the consumer's, then the panel's, on %s",
      async (_way, close) => {
        const calls: string[] = [];
        const setOpen = vi.fn((open: boolean) => calls.push(`panel ${open}`));
        const ref = createRef<DropdownPanelHandle>();
        render(
          <>
            <button type="button" id="trigger" popoverTarget="panel">
              Trigger
            </button>
            <Context.Provider value={createContextValue({ setOpen })}>
              <Component
                ref={ref}
                id="panel"
                aria-label="Options"
                onToggle={(event) => calls.push(`toggle ${event.newState}`)}
                onBeforeToggle={(event) =>
                  calls.push(`before ${event.newState}`)
                }
              >
                Content
              </Component>
            </Context.Provider>
          </>,
        );
        const panel = document.getElementById("panel") as HTMLElement;
        const trigger = screen.getByText("Trigger");
        calls.length = 0;
        fireEvent.click(trigger);
        await flushToggles();
        act(() =>
          close({ panel, trigger, ref } as ReturnType<typeof renderPanel>),
        );
        await flushToggles();
        expect(calls).toEqual([
          "before open",
          "toggle open",
          "panel true",
          "before closed",
          "toggle closed",
          "panel false",
        ]);
      },
    );
  });

  describe("panel mode stays open", () => {
    const openPanel = async () => {
      const onToggle = vi.fn();
      const parts = renderPanel(
        <form method="get" action="/filter">
          <label>
            <input type="checkbox" name="status" value="ready" /> Ready
          </label>
          <input type="text" name="query" aria-label="Search" />
          <button type="button">Apply</button>
          <button type="submit">Submit</button>
        </form>,
        { onToggle },
      );
      fireEvent.click(parts.trigger);
      await flushToggles();
      onToggle.mockClear();
      return { ...parts, onToggle };
    };

    it("stays open while a checkbox toggles", async () => {
      const { panel, onToggle } = await openPanel();
      // jsdom's own sheet hides popovers, so query by label, not by role.
      fireEvent.click(screen.getByLabelText("Ready"));
      await flushToggles();
      expect(screen.getByLabelText("Ready")).toBeChecked();
      expect(panel.matches(":popover-open")).toBe(true);
      expect(onToggle).not.toHaveBeenCalled();
    });

    it("stays open while a field changes, an Apply runs or focus leaves", async () => {
      const { panel, onToggle } = await openPanel();
      fireEvent.change(screen.getByLabelText("Search"), {
        target: { value: "web" },
      });
      fireEvent.click(screen.getByText("Apply"));
      const outside = document.createElement("button");
      document.body.append(outside);
      act(() => outside.focus());
      fireEvent.focusOut(panel);
      await flushToggles();
      expect(panel.matches(":popover-open")).toBe(true);
      expect(onToggle).not.toHaveBeenCalled();
      outside.remove();
    });

    it("leaves a native submit to the form", async () => {
      await openPanel();
      // On the window, in the bubble phase, the check runs after React's own
      // listener, so a handler there that cancelled the submit would show.
      const onSubmit = vi.fn((event: Event) => {
        const wasPrevented = event.defaultPrevented;
        // jsdom does not navigate; the test only reads defaultPrevented.
        event.preventDefault();
        return wasPrevented;
      });
      window.addEventListener("submit", onSubmit);
      fireEvent.submit(document.querySelector("form") as HTMLFormElement);
      window.removeEventListener("submit", onSubmit);
      expect(onSubmit).toHaveReturnedWith(false);
    });
  });

  describe("focus", () => {
    it("moves to the first control when the panel opens", async () => {
      const { trigger } = renderPanel(
        <>
          <button type="button" disabled>
            Disabled
          </button>
          <button type="button">First</button>
        </>,
      );
      fireEvent.click(trigger);
      await flushToggles();
      expect(document.activeElement).toBe(screen.getByText("First"));
    });

    it("skips controls that cannot take focus", async () => {
      const { trigger } = renderPanel(
        <form method="get">
          <input type="hidden" name="sort" value="name" />
          <fieldset disabled>
            <button type="button">In a disabled fieldset</button>
          </fieldset>
          <div hidden>
            <button type="button">Hidden</button>
          </div>
          <div inert>
            <button type="button">Inert</button>
          </div>
          <label>
            <input type="checkbox" name="status" value="ready" /> Ready
          </label>
        </form>,
      );
      fireEvent.click(trigger);
      await flushToggles();
      expect(document.activeElement).toBe(screen.getByLabelText("Ready"));
    });

    it("skips a control Tab would skip", async () => {
      const { trigger } = renderPanel(
        <>
          <button type="button" tabIndex={-1}>
            Out of the tab order
          </button>
          <input aria-label="Search" />
        </>,
      );
      fireEvent.click(trigger);
      await flushToggles();
      expect(document.activeElement).toBe(screen.getByLabelText("Search"));
    });

    it("moves focus in and back out inside a shadow root", async () => {
      const host = document.createElement("div");
      document.body.append(host);
      const shadow = host.attachShadow({ mode: "open" });
      const container = document.createElement("div");
      shadow.append(container);
      const ref = createRef<DropdownPanelHandle>();
      const { unmount } = render(
        <>
          <button type="button" id="trigger">
            Trigger
          </button>
          <Context.Provider value={createContextValue()}>
            <Component ref={ref} id="panel" aria-label="Options">
              <button type="button">Inside</button>
            </Component>
          </Context.Provider>
        </>,
        { container },
      );
      act(() => ref.current?.show());
      await flushToggles();
      expect(shadow.activeElement?.textContent).toBe("Inside");
      act(() => ref.current?.hide());
      await flushToggles();
      expect(shadow.activeElement?.textContent).toBe("Trigger");
      unmount();
      host.remove();
    });

    it("moves to the panel when no control takes focus", async () => {
      const { trigger, panel } = renderPanel(
        <fieldset disabled>
          <button type="button">Unavailable</button>
        </fieldset>,
      );
      fireEvent.click(trigger);
      await flushToggles();
      expect(document.activeElement).toBe(panel);
    });

    it("moves to the panel itself when it holds no control", async () => {
      const { trigger, panel } = renderPanel(<p>Nothing to focus</p>);
      fireEvent.click(trigger);
      await flushToggles();
      expect(document.activeElement).toBe(panel);
      expect(panel).toHaveAttribute("tabindex", "-1");
    });

    it("returns to the trigger when the panel closes with focus inside", async () => {
      const value = createContextValue();
      const ref = createRef<DropdownPanelHandle>();
      render(
        <>
          <button type="button" id="trigger">
            Trigger
          </button>
          <Context.Provider value={value}>
            <Component ref={ref} id="panel" aria-label="Options">
              <button type="button">Inside</button>
            </Component>
          </Context.Provider>
        </>,
      );
      act(() => ref.current?.show());
      await flushToggles();
      expect(document.activeElement).toBe(screen.getByText("Inside"));
      act(() => ref.current?.hide());
      await flushToggles();
      expect(document.activeElement).toBe(screen.getByText("Trigger"));
    });

    it("stays where it is when the panel closes with focus outside", async () => {
      const { trigger, ref } = renderPanel(<button type="button">In</button>);
      fireEvent.click(trigger);
      await flushToggles();
      act(() => trigger.focus());
      act(() => ref.current?.hide());
      await flushToggles();
      expect(document.activeElement).toBe(trigger);
    });

    it("leaves focus to the browser when the panel has no trigger id", async () => {
      const { ref, trigger } = renderPanel(<button type="button">In</button>);
      act(() => trigger.focus());
      act(() => ref.current?.show());
      await flushToggles();
      act(() => ref.current?.hide());
      await flushToggles();
      // The stand-in, as a browser does, returned it to where it was before.
      expect(document.activeElement).toBe(trigger);
    });

    it("does not throw when its trigger is missing", async () => {
      const ref = createRef<DropdownPanelHandle>();
      render(
        <Context.Provider value={createContextValue({ triggerId: "gone" })}>
          <Component ref={ref} id="panel" aria-label="Options">
            <button type="button">Inside</button>
          </Component>
        </Context.Provider>,
      );
      act(() => ref.current?.show());
      await flushToggles();
      act(() => ref.current?.hide());
      await expect(flushToggles()).resolves.toBeUndefined();
    });
  });

  describe("markup", () => {
    it("is named DropdownPanel", () => {
      expect(Component.displayName).toBe("DropdownPanel");
    });

    it("is a named dialog once hydrated", () => {
      const { panel } = renderPanel(null, {
        "aria-label": undefined,
        "aria-labelledby": "label",
      });
      expect(panel).toHaveAttribute("role", "dialog");
      expect(panel).toHaveAttribute("aria-labelledby", "label");
      expect(panel).toHaveAttribute("popover", "auto");
    });

    it("keeps the consumer's props, classes last", () => {
      const { panel } = renderPanel(null, {
        className: "wide",
        "data-testid": "options",
        style: { inlineSize: "10rem" },
      } as Partial<Parameters<typeof Component>[0]>);
      expect(panel.className).toBe("ds dropdown-button-panel surface wide");
      expect(panel).toHaveAttribute("data-testid", "options");
      expect(panel.style.inlineSize).toBe("10rem");
    });

    it("is anchored under its trigger when the HOC provides an anchor", () => {
      render(
        <Context.Provider value={createContextValue()}>
          <Component ref={createRef()} id="panel" aria-label="Options">
            Content
          </Component>
        </Context.Provider>,
      );
      expect(document.getElementById("panel")?.className).toBe(
        "ds dropdown-button-panel surface anchored",
      );
    });

    it("provides its own state when composed directly", () => {
      renderPanel();
      expect(screen.getByTestId("open")).toHaveTextContent("false");
    });

    it("reads the HOC's state when there is one", () => {
      render(
        <Context.Provider value={createContextValue({ isOpen: true })}>
          <Component ref={createRef()} id="panel" aria-label="Options">
            <OpenState />
          </Component>
        </Context.Provider>,
      );
      expect(screen.getByTestId("open")).toHaveTextContent("true");
    });
  });

  describe("menu mode", () => {
    const renderMenuPanel = () =>
      renderPanel(
        <>
          <Menu items={[{ key: "copy", label: "Copy" }]} data-testid="menu" />
          <OpenState />
        </>,
        { "aria-label": "Actions" },
      );

    it("takes no role and no name: the menu carries them", () => {
      const { panel } = renderMenuPanel();
      expect(panel).not.toHaveAttribute("role");
      expect(panel).not.toHaveAttribute("aria-label");
    });

    it("hands its name to the menu inside", () => {
      const NameProbe = () => {
        const panel = usePanelContext();
        return <output data-testid="name">{panel?.label}</output>;
      };
      renderPanel(<NameProbe />, { "aria-label": "Actions" });
      expect(screen.getByTestId("name")).toHaveTextContent("Actions");
    });

    it("leaves focus to the menu when it opens", async () => {
      const { panel, trigger } = renderMenuPanel();
      act(() => trigger.focus());
      fireEvent.click(trigger);
      await flushToggles();
      expect(document.activeElement).not.toBe(panel);
    });

    it("resets the menu's focus intent when it closes", async () => {
      const value = createContextValue();
      const ref = createRef<DropdownPanelHandle>();
      render(
        <Context.Provider value={value}>
          <Component ref={ref} id="panel" aria-label="Options">
            Content
          </Component>
        </Context.Provider>,
      );
      act(() => ref.current?.show());
      await flushToggles();
      act(() => ref.current?.hide());
      await flushToggles();
      expect(value.setFocusIntent).toHaveBeenCalledWith("first");
    });
  });

  describe("state the toggle event missed", () => {
    it("reads a popover opened before hydration", async () => {
      const ui = (
        <Component ref={createRef()} id="early" aria-label="Options">
          <OpenState />
        </Component>
      );
      const container = document.createElement("div");
      container.innerHTML = renderToString(ui);
      document.body.append(container);
      const panel = container.querySelector("#early") as HTMLElement;
      panel.showPopover();
      // Let the stand-in's queued toggle fire before React listens.
      await Promise.resolve();
      const onRecoverableError = vi.fn();
      const root = await act(async () =>
        hydrateRoot(container, ui, { onRecoverableError }),
      );
      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(screen.getByTestId("open")).toHaveTextContent("true");
      act(() => root.unmount());
      container.remove();
    });

    it("re-reads the state on pageshow while open", async () => {
      const { ref, panel } = renderPanel();
      act(() => ref.current?.show());
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
      const { ref } = renderPanel();
      expect(add).not.toHaveBeenCalledWith("pageshow", expect.anything());
      act(() => ref.current?.show());
      await flushToggles();
      expect(add).toHaveBeenCalledWith("pageshow", expect.any(Function));
      act(() => ref.current?.hide());
      await flushToggles();
      expect(remove).toHaveBeenCalledWith("pageshow", expect.any(Function));
      add.mockRestore();
      remove.mockRestore();
    });
  });
});
