import { Button } from "@canonical/react-ds-global";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import installPopoverStandIn from "../../../../testing/installPopoverStandIn.js";
import DropdownPanelStandIn from "./DropdownPanelStandIn.js";
import type { WithDropdownRender } from "./types.js";
import withDropdownButtonStandIn from "./withDropdownButtonStandIn.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const renderPanel: WithDropdownRender = ({ ref, id, triggerId, close }) => (
  <DropdownPanelStandIn ref={ref} id={id} aria-labelledby={triggerId}>
    <label>
      <input type="checkbox" /> Deployed
    </label>
    <button type="button" onClick={close}>
      Done
    </button>
  </DropdownPanelStandIn>
);

const StatusTrigger = withDropdownButtonStandIn(Button, renderPanel);

const flushToggle = () => act(() => Promise.resolve());

describe("withDropdownButtonStandIn", () => {
  it("names the component after its trigger", () => {
    expect(StatusTrigger.displayName).toBe("withDropdownButtonStandIn(Button)");
    const Plain = (props: ComponentProps<"button">): ReactElement => (
      <button type="button" {...props} />
    );
    const Anonymous = withDropdownButtonStandIn(
      ((props: ComponentProps<"button">) => (
        <button type="button" {...props} />
      )) as (props: ComponentProps<"button">) => ReactElement,
      renderPanel,
    );
    expect(withDropdownButtonStandIn(Plain, renderPanel).displayName).toBe(
      "withDropdownButtonStandIn(Plain)",
    );
    expect(Anonymous.displayName).toBe(
      "withDropdownButtonStandIn(AnonymousComponent)",
    );
  });

  it("renders a button trigger with a chevron and no popup ARIA before hydration", () => {
    const html = renderToString(<StatusTrigger>Status</StatusTrigger>);
    expect(html).toContain('type="button"');
    expect(html).toContain("dropdown-button");
    expect(html).toContain('class="chevron"');
    expect(html).toMatch(/popovertarget="/i);
    expect(html).not.toContain("aria-haspopup");
  });

  it("names the panel by the trigger and advertises a dialog once hydrated", () => {
    render(
      <StatusTrigger id="status" className="extra">
        Status
      </StatusTrigger>,
    );
    const trigger = screen.getByRole("button", { name: "Status" });
    expect(trigger).toHaveAttribute("id", "status");
    expect(trigger).toHaveClass("dropdown-button", "extra");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    const panelId = trigger.getAttribute("aria-controls") as string;
    expect(trigger).toHaveAttribute("popovertarget", panelId);
    expect(document.getElementById(panelId)).toHaveAttribute(
      "aria-labelledby",
      "status",
    );
  });

  it("tethers the panel to the trigger through an anchor name", () => {
    render(<StatusTrigger style={{ color: "red" }}>Status</StatusTrigger>);
    const trigger = screen.getByRole("button", { name: "Status" });
    const anchor = trigger.style.getPropertyValue("anchor-name");
    expect(anchor).toMatch(/^--/);
    expect(trigger.style.color).toBe("red");
    const panel = document.getElementById(
      trigger.getAttribute("aria-controls") as string,
    ) as HTMLElement;
    expect(panel).toHaveClass("anchored");
    expect(panel.style.getPropertyValue("position-anchor")).toBe(anchor);
  });

  it("names the anchor with only what a CSS ident holds", () => {
    // A root's identifierPrefix can put a colon in every id.
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container, { identifierPrefix: "a:b" });
    act(() => root.render(<StatusTrigger>Status</StatusTrigger>));
    const trigger = container.querySelector("button") as HTMLElement;
    const anchor = trigger.style.getPropertyValue("anchor-name");
    expect(anchor).toMatch(/^--[\w-]+$/);
    expect(anchor).toContain("a_b");
    act(() => root.unmount());
    container.remove();
  });

  it("opens from the trigger, stays open while a control changes, and closes", async () => {
    render(<StatusTrigger>Status</StatusTrigger>);
    const trigger = screen.getByRole("button", { name: "Status" });
    fireEvent.click(trigger);
    await flushToggle();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const checkbox = screen.getByRole("checkbox", { hidden: true });
    fireEvent.click(checkbox);
    await flushToggle();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { hidden: true, name: "Done" }));
    await flushToggle();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders a plain button when the type passed is undefined", () => {
    render(<StatusTrigger type={undefined}>Status</StatusTrigger>);
    expect(screen.getByRole("button", { name: "Status" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("gives focus back to the trigger when the panel closes with focus inside", async () => {
    render(<StatusTrigger>Status</StatusTrigger>);
    const trigger = screen.getByRole("button", { name: "Status" });
    // Opened by script, as Safari leaves a clicked button unfocused.
    act(() => trigger.click());
    await flushToggle();
    expect(screen.getByRole("checkbox", { hidden: true })).toHaveFocus();
    act(() => (document.activeElement as HTMLElement).blur());
    act(() => screen.getByRole("checkbox", { hidden: true }).focus());
    fireEvent.click(screen.getByRole("button", { hidden: true, name: "Done" }));
    await flushToggle();
    expect(trigger).toHaveFocus();
  });

  it("reads a panel opened before it hydrated", () => {
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, "matches").mockImplementation(function (
      this: Element,
      selector: string,
    ) {
      return selector === ":popover-open" || matches.call(this, selector);
    });
    render(<StatusTrigger>Status</StatusTrigger>);
    expect(screen.getByRole("button", { name: "Status" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    vi.restoreAllMocks();
  });

  it("returns focus to the trigger on Escape", async () => {
    render(<StatusTrigger>Status</StatusTrigger>);
    const trigger = screen.getByRole("button", { name: "Status" });
    trigger.focus();
    fireEvent.click(trigger);
    await flushToggle();
    expect(screen.getByRole("checkbox", { hidden: true })).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    await flushToggle();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("lets the consumer's onClick cancel the toggle", async () => {
    render(
      <StatusTrigger onClick={(event) => event.preventDefault()}>
        Status
      </StatusTrigger>,
    );
    const trigger = screen.getByRole("button", { name: "Status" });
    fireEvent.click(trigger);
    await flushToggle();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
