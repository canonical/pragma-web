import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { type ComponentProps, createRef } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import installPopoverStandIn from "../../../../testing/installPopoverStandIn.js";
import { IconButtonStandIn as IconButton } from "../IconButtonStandIn/index.js";
import { DropdownPanel } from "./common/Panel/index.js";
import type { WithDropdownRender } from "./types.js";
import withDropdownPanel from "./withDropdownPanel.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

/** Lets the queued toggle events reach React. */
const flushToggles = () => act(async () => {});

const renderOptions: WithDropdownRender = ({ ref, id, triggerId, close }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <button type="button" onClick={close}>
      Done
    </button>
    <output data-testid="render-props">{`${id} ${triggerId}`}</output>
  </DropdownPanel>
);

const OptionsTrigger = withDropdownPanel(Button, renderOptions);
const MenuTrigger = withDropdownPanel(Button, ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <DropdownPanel.Menu items={[{ key: "copy", label: "Copy" }]} />
  </DropdownPanel>
));
const SettingsTrigger = withDropdownPanel(IconButton, renderOptions);

const renderTrigger = (props: ComponentProps<typeof OptionsTrigger> = {}) => {
  const result = render(<OptionsTrigger {...props}>Options</OptionsTrigger>);
  const trigger = assertInvariant(
    screen.getByText("Options").closest("button"),
    "the element renders",
  );
  const panel = assertInvariant(
    trigger.nextElementSibling,
    "the element renders",
  ) as HTMLElement;
  return { ...result, trigger, panel };
};

describe("withDropdownPanel", () => {
  describe("composition", () => {
    it("renders the trigger and the panel as siblings, with no root", () => {
      const { container, trigger, panel } = renderTrigger();
      expect(container.children).toHaveLength(2);
      expect(container.firstElementChild).toBe(trigger);
      expect(panel).toHaveClass("dropdown-button-panel");
    });

    it("names the component after its trigger", () => {
      expect(OptionsTrigger.displayName).toBe("withDropdownPanel(Button)");
      const Named = () => <button type="button" />;
      Named.displayName = "Named";
      expect(withDropdownPanel(Named, renderOptions).displayName).toBe(
        "withDropdownPanel(Named)",
      );
      expect(
        withDropdownPanel(
          (() => <button type="button" />) as () => React.ReactElement,
          renderOptions,
        ).displayName,
      ).toBe("withDropdownPanel(AnonymousComponent)");
    });

    it("draws no chevron", () => {
      const { trigger } = renderTrigger();
      expect(trigger.querySelector(".chevron")).toBeNull();
    });

    it("wires an icon-only trigger", () => {
      render(
        <SettingsTrigger
          icon="settings"
          importance="tertiary"
          aria-label="Settings"
        />,
      );
      const trigger = screen.getByRole("button", { name: "Settings" });
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
      expect(trigger.className).toBe("ds button tertiary ds icon-button");
    });
  });

  describe("the trigger's props", () => {
    it("pass through to the button", () => {
      const { trigger } = renderTrigger({
        className: "active",
        "data-active": true,
        importance: "secondary",
        disabled: true,
      } as ComponentProps<typeof OptionsTrigger>);
      expect(trigger.className).toBe("ds button secondary active");
      expect(trigger).toHaveAttribute("data-active", "true");
      expect(trigger).toBeDisabled();
    });

    it("keep the consumer's id, and hand it to the render function", () => {
      const { trigger, panel } = renderTrigger({ id: "status" });
      expect(trigger.id).toBe("status");
      expect(screen.getByTestId("render-props")).toHaveTextContent(
        `${panel.id} status`,
      );
      expect(panel).toHaveAttribute("aria-labelledby", "status");
    });

    it("merge the consumer's style under the anchor name", () => {
      const { trigger } = renderTrigger({
        style: { marginInlineStart: "1rem" },
      });
      expect(trigger.style.marginInlineStart).toBe("1rem");
    });

    it("render type=button unless a type is passed", () => {
      expect(renderTrigger().trigger).toHaveAttribute("type", "button");
    });

    it("render type=button when a forwarded type is undefined", () => {
      const { trigger } = renderTrigger({ type: undefined });
      expect(trigger).toHaveAttribute("type", "button");
    });

    it("keep a type the consumer passes", () => {
      render(<OptionsTrigger type="submit">Submit</OptionsTrigger>);
      expect(screen.getByText("Submit").closest("button")).toHaveAttribute(
        "type",
        "submit",
      );
    });

    it("never win over the keys the HOC owns, even when forced", () => {
      const forced = {
        popoverTarget: "elsewhere",
        popoverTargetAction: "show",
        "aria-haspopup": "listbox",
        "aria-expanded": true,
        "aria-controls": "elsewhere",
      } as unknown as ComponentProps<typeof OptionsTrigger>;
      const { trigger, panel } = renderTrigger(forced);
      expect(trigger).toHaveAttribute("popovertarget", panel.id);
      expect(trigger).not.toHaveAttribute("popovertargetaction");
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-controls", panel.id);
    });

    it("run the consumer's onClick, whose preventDefault cancels the toggle", async () => {
      const onClick = vi.fn((event: React.MouseEvent) =>
        event.preventDefault(),
      );
      const { trigger, panel } = renderTrigger({ onClick });
      fireEvent.click(trigger);
      await flushToggles();
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(panel.matches(":popover-open")).toBe(false);
    });
  });

  describe("aria-expanded", () => {
    const ways: [string, (parts: ReturnType<typeof renderTrigger>) => void][] =
      [
        ["Escape", ({ panel }) => fireEvent.keyDown(panel, { key: "Escape" })],
        ["a click outside", () => fireEvent.pointerUp(document.body)],
        ["the trigger", ({ trigger }) => fireEvent.click(trigger)],
        ["close()", () => fireEvent.click(screen.getByText("Done"))],
      ];

    it.each(ways)("follows the panel closing on %s", async (_way, close) => {
      const parts = renderTrigger();
      fireEvent.click(parts.trigger);
      await flushToggles();
      expect(parts.trigger).toHaveAttribute("aria-expanded", "true");
      act(() => close(parts));
      await flushToggles();
      expect(parts.trigger).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("leaves its state alone when a panel composed inside it toggles", async () => {
    const Outer = withDropdownPanel(Button, ({ ref, id, triggerId }) => (
      <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
        <button type="button" popoverTarget="inner">
          Inner trigger
        </button>
        <DropdownPanel ref={createRef()} id="inner" aria-label="Inner">
          Inner content
        </DropdownPanel>
      </DropdownPanel>
    ));
    render(<Outer>Outer</Outer>);
    const outer = assertInvariant(
      screen.getByText("Outer").closest("button"),
      "the element renders",
    );
    const inner = assertInvariant(
      document.getElementById("inner"),
      "the element renders",
    );
    fireEvent.click(outer);
    await flushToggles();
    act(() => inner.showPopover());
    await flushToggles();
    act(() => inner.hidePopover());
    await flushToggles();
    expect(outer).toHaveAttribute("aria-expanded", "true");
    expect(inner).not.toHaveClass("anchored");
  });

  describe("the render props", () => {
    it("give the panel's id, which the trigger targets", () => {
      const { trigger, panel } = renderTrigger();
      expect(screen.getByTestId("render-props")).toHaveTextContent(
        `${panel.id} ${trigger.id}`,
      );
      expect(trigger).toHaveAttribute("aria-controls", panel.id);
    });

    it("close() returns focus to the trigger", async () => {
      const { trigger, panel } = renderTrigger();
      fireEvent.click(trigger);
      await flushToggles();
      expect(document.activeElement).toBe(screen.getByText("Done"));
      fireEvent.click(screen.getByText("Done"));
      await flushToggles();
      expect(panel.matches(":popover-open")).toBe(false);
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe("menu mode", () => {
    const ItemsTrigger = withDropdownPanel(Button, ({ ref, id, triggerId }) => (
      <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
        <DropdownPanel.Menu
          items={[
            { key: "cut", label: "Cut" },
            { key: "copy", label: "Copy" },
            { key: "paste", label: "Paste", disabled: true },
          ]}
        />
      </DropdownPanel>
    ));

    it.each([
      ["ArrowDown", "Cut"],
      ["ArrowUp", "Copy"],
    ])(
      "moves focus into an open menu on %s from the trigger",
      async (key, label) => {
        Element.prototype.scrollIntoView = () => {};
        render(<ItemsTrigger>Edit</ItemsTrigger>);
        const trigger = assertInvariant(
          screen.getByText("Edit").closest("button"),
          "the trigger renders",
        );
        fireEvent.click(trigger);
        await flushToggles();
        act(() => trigger.focus());
        fireEvent.keyDown(trigger, { key });
        expect(document.activeElement).toHaveTextContent(label);
        expect(document.activeElement).toHaveAttribute("tabindex", "0");
        Reflect.deleteProperty(Element.prototype, "scrollIntoView");
      },
    );

    const renderMenuTrigger = (
      props: ComponentProps<typeof MenuTrigger> = {},
    ) => {
      render(<MenuTrigger {...props}>Actions</MenuTrigger>);
      const trigger = assertInvariant(
        screen.getByText("Actions").closest("button"),
        "the trigger renders",
      );
      return {
        trigger,
        panel: assertInvariant(
          trigger.nextElementSibling,
          "the element renders",
        ) as HTMLElement,
      };
    };

    it("advertises a menu", () => {
      expect(renderMenuTrigger().trigger).toHaveAttribute(
        "aria-haspopup",
        "menu",
      );
    });

    it.each(["ArrowDown", "ArrowUp"])("opens on %s", async (key) => {
      const { trigger, panel } = renderMenuTrigger();
      const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
      });
      act(() => {
        trigger.dispatchEvent(event);
      });
      await flushToggles();
      expect(event.defaultPrevented).toBe(true);
      expect(panel.matches(":popover-open")).toBe(true);
    });

    it("leaves other keys alone", async () => {
      const { trigger, panel } = renderMenuTrigger();
      fireEvent.keyDown(trigger, { key: "a" });
      await flushToggles();
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("runs the consumer's onKeyDown first, whose preventDefault skips its own", async () => {
      const onKeyDown = vi.fn((event: React.KeyboardEvent) =>
        event.preventDefault(),
      );
      const { trigger, panel } = renderMenuTrigger({ onKeyDown });
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      await flushToggles();
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("ignores the arrows in panel mode", async () => {
      const { trigger, panel } = renderTrigger();
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      await flushToggles();
      expect(panel.matches(":popover-open")).toBe(false);
    });
  });
});
