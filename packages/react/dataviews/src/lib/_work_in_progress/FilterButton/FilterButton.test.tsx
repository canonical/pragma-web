import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { installPopoverStandIn } from "../../../../testing/index.js";
import FilterButton from "./FilterButton.js";
import type { FilterButtonPanelHandle } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const flushToggle = () => act(() => Promise.resolve());

const options = (
  <label>
    <input type="checkbox" name="status" value="deployed" /> Deployed
  </label>
);

describe("FilterButton", () => {
  describe("the trigger", () => {
    it("is Button's tertiary face, with a chevron and the filter class", () => {
      render(
        <FilterButton label="Status" className="extra">
          {options}
        </FilterButton>,
      );
      const trigger = screen.getByRole("button", { name: "Status" });
      expect(trigger).toHaveClass(
        "ds",
        "button",
        "tertiary",
        "filter-button",
        "extra",
      );
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
      expect(trigger.querySelector(".chevron")).not.toBeNull();
    });

    it("keeps the neutral Tertiary face whatever importance or anticipation reaches it", () => {
      const props = {
        importance: "primary",
        anticipation: "destructive",
      } as Record<string, unknown>;
      render(
        <FilterButton label="Status" {...props}>
          {options}
        </FilterButton>,
      );
      const trigger = screen.getByRole("button", { name: "Status" });
      expect(trigger).toHaveClass("tertiary");
      expect(trigger).not.toHaveClass("primary");
      expect(trigger).not.toHaveClass("destructive");
    });

    it("is a plain button that names and controls its panel", () => {
      render(
        <FilterButton label="Status" id="status" type={undefined}>
          {options}
        </FilterButton>,
      );
      const trigger = screen.getByRole("button", { name: "Status" });
      expect(trigger).toHaveAttribute("id", "status");
      expect(trigger).toHaveAttribute("type", "button");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      const panelId = trigger.getAttribute("aria-controls") as string;
      expect(trigger).toHaveAttribute("popovertarget", panelId);
      expect(document.getElementById(panelId)).toHaveAttribute(
        "aria-labelledby",
        "status",
      );
    });

    it("tethers the panel to the trigger through an anchor name", () => {
      render(
        <FilterButton label="Status" style={{ color: "red" }}>
          {options}
        </FilterButton>,
      );
      const trigger = screen.getByRole("button", { name: "Status" });
      const anchor = trigger.style.getPropertyValue("anchor-name");
      expect(anchor).toMatch(/^--/);
      expect(trigger.style.color).toBe("red");
      const panel = document.getElementById(
        trigger.getAttribute("aria-controls") as string,
      ) as HTMLElement;
      expect(panel.style.getPropertyValue("position-anchor")).toBe(anchor);
    });

    it("names the anchor with only what a CSS ident holds", () => {
      // A root's identifierPrefix can put a colon in every id.
      const container = document.createElement("div");
      document.body.append(container);
      const root = createRoot(container, { identifierPrefix: "a:b" });
      act(() =>
        root.render(<FilterButton label="Status">{options}</FilterButton>),
      );
      const trigger = container.querySelector("button") as HTMLElement;
      const anchor = trigger.style.getPropertyValue("anchor-name");
      expect(anchor).toMatch(/^--[\w-]+$/);
      expect(anchor).toContain("a_b");
      act(() => root.unmount());
      container.remove();
    });

    it("passes Button's other props to the trigger", () => {
      render(
        <FilterButton label="Status" disabled data-testid="status">
          {options}
        </FilterButton>,
      );
      expect(screen.getByTestId("status")).toBeDisabled();
    });
  });

  describe("the applied state", () => {
    it("shows no count, words or mark while nothing applies", () => {
      render(
        <FilterButton label="Status" condition="exclusion">
          {options}
        </FilterButton>,
      );
      const trigger = screen.getByRole("button", { name: "Status" });
      expect(trigger.querySelector(".ds.badge")).toBeNull();
      expect(trigger.querySelector(".mark")).toBeNull();
      expect(trigger.querySelector(".assistive")).toBeNull();
    });

    it("names the trigger with the applied words and hides the Badge", () => {
      render(
        <FilterButton label="Status" applied={2} appliedLabel="2 applied">
          {options}
        </FilterButton>,
      );
      const trigger = screen.getByRole("button", { name: "Status, 2 applied" });
      const badge = trigger.querySelector(".ds.badge");
      expect(badge).toHaveAttribute("aria-hidden", "true");
      expect(badge).toHaveTextContent("2");
      expect(trigger.querySelector(".mark")).toBeNull();
    });

    it("shows the Condition mark, hidden from assistive technology, before the count", () => {
      render(
        <FilterButton
          label="Status"
          applied={2}
          appliedLabel="none of 2"
          condition="exclusion"
        >
          {options}
        </FilterButton>,
      );
      const trigger = screen.getByRole("button", { name: "Status, none of 2" });
      const mark = trigger.querySelector(".mark");
      expect(mark).toHaveAttribute("data-condition", "exclusion");
      expect(mark).toHaveAttribute("aria-hidden", "true");
      expect(
        mark?.compareDocumentPosition(
          trigger.querySelector(".ds.badge") as Node,
        ),
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it("refuses a count without its words", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const props = { applied: 2 } as { applied: number; appliedLabel: string };
      expect(() =>
        render(
          <FilterButton label="Status" {...props}>
            {options}
          </FilterButton>,
        ),
      ).toThrow("`appliedLabel` is required while `applied` is above 0.");
      vi.restoreAllMocks();
    });
  });

  describe("the panel", () => {
    it("is a dialog named by the trigger that stays open while a checkbox changes", async () => {
      const StatusFilter = () => {
        const [applied, setApplied] = useState(0);
        return (
          <FilterButton
            label="Status"
            applied={applied}
            appliedLabel={`${applied} applied`}
          >
            <label>
              <input
                type="checkbox"
                onChange={(event) => setApplied(event.target.checked ? 1 : 0)}
              />{" "}
              Deployed
            </label>
          </FilterButton>
        );
      };
      render(<StatusFilter />);
      const trigger = screen.getByRole("button", { name: "Status" });
      fireEvent.click(trigger);
      await flushToggle();
      const panel = document.getElementById(
        trigger.getAttribute("aria-controls") as string,
      ) as HTMLElement;
      expect(panel).toHaveAttribute("role", "dialog");
      expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
      const checkbox = screen.getByRole("checkbox", {
        hidden: true,
        name: "Deployed",
      });
      // The press a pointer makes, which light dismiss reads, then its click.
      fireEvent.pointerUp(checkbox);
      fireEvent.click(checkbox);
      await flushToggle();
      expect(
        screen.getByRole("button", { name: "Status, 1 applied" }),
      ).toHaveAttribute("aria-expanded", "true");
      expect(panel.matches(":popover-open")).toBe(true);
    });

    it("tells onToggle of every opening and closing", async () => {
      const onToggle = vi.fn();
      const panelRef = createRef<FilterButtonPanelHandle>();
      render(
        <FilterButton label="Status" onToggle={onToggle} panelRef={panelRef}>
          {options}
        </FilterButton>,
      );
      const trigger = screen.getByRole("button", { name: "Status" });
      const readStates = () =>
        onToggle.mock.calls.map(([event]) => (event as ToggleEvent).newState);

      fireEvent.click(trigger);
      await flushToggle();
      fireEvent.click(trigger);
      await flushToggle();
      fireEvent.click(trigger);
      await flushToggle();
      fireEvent.keyDown(document, { key: "Escape" });
      await flushToggle();
      fireEvent.click(trigger);
      await flushToggle();
      fireEvent.pointerUp(document.body);
      await flushToggle();
      act(() => panelRef.current?.show());
      await flushToggle();
      act(() => panelRef.current?.hide());
      await flushToggle();
      expect(readStates()).toEqual([
        "open",
        "closed",
        "open",
        "closed",
        "open",
        "closed",
        "open",
        "closed",
      ]);
    });

    it("lets a host drive it through panelRef", async () => {
      const panelRef = createRef<FilterButtonPanelHandle>();
      render(
        <FilterButton label="Status" panelRef={panelRef}>
          {options}
        </FilterButton>,
      );
      const trigger = screen.getByRole("button", { name: "Status" });
      act(() => panelRef.current?.toggle());
      await flushToggle();
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      act(() => panelRef.current?.toggle());
      await flushToggle();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("moves focus in on opening and back to the trigger on Escape", async () => {
      render(<FilterButton label="Status">{options}</FilterButton>);
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

    it("gives focus back to the trigger when the trigger closes it", async () => {
      render(<FilterButton label="Status">{options}</FilterButton>);
      const trigger = screen.getByRole("button", { name: "Status" });
      // Opened by script, as Safari leaves a clicked button unfocused.
      act(() => trigger.click());
      await flushToggle();
      expect(screen.getByRole("checkbox", { hidden: true })).toHaveFocus();
      act(() => trigger.click());
      await flushToggle();
      expect(trigger).toHaveFocus();
    });

    it("closes on a press outside and leaves focus where it went", async () => {
      render(
        <>
          <FilterButton label="Status">{options}</FilterButton>
          <button type="button">Elsewhere</button>
        </>,
      );
      const trigger = screen.getByRole("button", { name: "Status" });
      fireEvent.click(trigger);
      await flushToggle();
      const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
      act(() => elsewhere.focus());
      fireEvent.pointerUp(elsewhere);
      await flushToggle();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(elsewhere).toHaveFocus();
    });

    it("runs the consumer's onClick first, whose preventDefault cancels the toggle", async () => {
      const onClick = vi.fn((event: { preventDefault: () => void }) =>
        event.preventDefault(),
      );
      render(
        <FilterButton label="Status" onClick={onClick}>
          {options}
        </FilterButton>,
      );
      const trigger = screen.getByRole("button", { name: "Status" });
      fireEvent.click(trigger);
      await flushToggle();
      expect(onClick).toHaveBeenCalledOnce();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });
});
