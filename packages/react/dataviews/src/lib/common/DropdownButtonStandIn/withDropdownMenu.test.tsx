import { assertInvariant } from "@canonical/dataviews-core/bindings";
import { Button } from "@canonical/react-ds-global";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { installPopoverStandIn } from "../../../../testing/index.js";
import { IconButtonStandIn as IconButton } from "../IconButtonStandIn/index.js";
import type { DropdownMenuEntry } from "./common/Menu/types.js";
import withDropdownMenu from "./withDropdownMenu.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

/** Lets the queued toggle events reach React. */
const flushToggles = () => act(async () => {});

const items: DropdownMenuEntry[] = [
  { key: "cut", label: "Cut" },
  { key: "copy", label: "Copy" },
  { key: "paste", label: "Paste", disabled: true },
];

const EditTrigger = withDropdownMenu(Button);
const SettingsTrigger = withDropdownMenu(IconButton);

const renderTrigger = (
  props: Partial<ComponentProps<typeof EditTrigger>> = {},
) => {
  const result = render(
    <EditTrigger items={items} {...props}>
      Edit
    </EditTrigger>,
  );
  const trigger = assertInvariant(
    screen.getByText("Edit").closest("button"),
    "the element renders",
  );
  const panel = assertInvariant(
    trigger.nextElementSibling,
    "the element renders",
  ) as HTMLElement;
  return { ...result, trigger, panel };
};

describe("withDropdownMenu", () => {
  describe("composition", () => {
    it("renders the trigger and the menu's popover as siblings, with no root", () => {
      const { container, trigger, panel } = renderTrigger();
      expect(container.children).toHaveLength(2);
      expect(container.firstElementChild).toBe(trigger);
      expect(panel).toHaveClass("dropdown-button-panel");
      expect(panel.firstElementChild).toHaveClass("dropdown-button-menu");
    });

    it("names the component after its trigger", () => {
      expect(EditTrigger.displayName).toBe("withDropdownMenu(Button)");
      const Named = () => <button type="button" />;
      Named.displayName = "Named";
      expect(withDropdownMenu(Named).displayName).toBe(
        "withDropdownMenu(Named)",
      );
      expect(
        withDropdownMenu((() => (
          <button type="button" />
        )) as () => React.ReactElement).displayName,
      ).toBe("withDropdownMenu(AnonymousComponent)");
    });

    it("draws no chevron", () => {
      const { trigger } = renderTrigger();
      expect(trigger.querySelector(".chevron")).toBeNull();
    });

    it("wires an icon-only trigger, which names the menu", async () => {
      render(
        <SettingsTrigger
          icon="settings"
          importance="tertiary"
          aria-label="Settings"
          items={items}
        />,
      );
      const trigger = screen.getByRole("button", { name: "Settings" });
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
      expect(trigger.className).toBe("ds button tertiary ds icon-button");
      fireEvent.click(trigger);
      await waitFor(() =>
        expect(screen.getByRole("menu", { name: "Settings" })).toBeVisible(),
      );
    });
  });

  it("names the menu after a heading that names its trigger", async () => {
    render(
      <>
        <h3 id="status-heading">
          <svg role="img" aria-label="Status" />
        </h3>
        <SettingsTrigger
          icon="menu-contextual"
          aria-labelledby="status-heading"
          labelledBy="status-heading"
          items={items}
        />
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Status" });
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByRole("menu", { name: "Status" })).toBeVisible(),
    );
  });

  describe("the trigger's props", () => {
    it("pass through to the button", () => {
      const { trigger } = renderTrigger({
        className: "active",
        "data-active": true,
        importance: "secondary",
        disabled: true,
      } as Partial<ComponentProps<typeof EditTrigger>>);
      expect(trigger.className).toBe("ds button secondary active");
      expect(trigger).toHaveAttribute("data-active", "true");
      expect(trigger).toBeDisabled();
    });

    it("keep the consumer's id, which names the menu", async () => {
      const { trigger } = renderTrigger({ id: "edit" });
      expect(trigger.id).toBe("edit");
      fireEvent.click(trigger);
      await waitFor(() =>
        expect(screen.getByRole("menu")).toHaveAttribute(
          "aria-labelledby",
          "edit",
        ),
      );
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
      const { trigger } = renderTrigger({ type: "submit" });
      expect(trigger).toHaveAttribute("type", "submit");
    });

    it("never win over the keys the HOC owns, even when forced", () => {
      const forced = {
        popoverTarget: "elsewhere",
        popoverTargetAction: "show",
        "aria-haspopup": "listbox",
        "aria-expanded": true,
        "aria-controls": "elsewhere",
      } as unknown as Partial<ComponentProps<typeof EditTrigger>>;
      const { trigger, panel } = renderTrigger(forced);
      expect(trigger).toHaveAttribute("popovertarget", panel.id);
      expect(trigger).not.toHaveAttribute("popovertargetaction");
      expect(trigger).toHaveAttribute("aria-haspopup", "menu");
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
        ["a choice", () => fireEvent.click(screen.getByText("Cut"))],
      ];

    it.each(ways)("follows the menu closing on %s", async (_way, close) => {
      const parts = renderTrigger();
      fireEvent.click(parts.trigger);
      await waitFor(() =>
        expect(parts.trigger).toHaveAttribute("aria-expanded", "true"),
      );
      act(() => close(parts));
      await waitFor(() =>
        expect(parts.trigger).toHaveAttribute("aria-expanded", "false"),
      );
    });
  });

  describe("the arrow keys", () => {
    it.each([
      ["ArrowDown", "Cut"],
      ["ArrowUp", "Copy"],
    ])("open the menu on %s with focus on %s", async (key, label) => {
      const { trigger, panel } = renderTrigger();
      const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
      });
      act(() => {
        trigger.dispatchEvent(event);
      });
      expect(event.defaultPrevented).toBe(true);
      expect(panel.matches(":popover-open")).toBe(true);
      await waitFor(() =>
        expect(screen.getByRole("menuitem", { name: label })).toHaveFocus(),
      );
    });

    it.each([
      ["ArrowDown", "Cut"],
      ["ArrowUp", "Copy"],
    ])(
      "move focus into an open menu on %s from the trigger",
      async (key, label) => {
        const { trigger } = renderTrigger();
        fireEvent.click(trigger);
        await waitFor(() => expect(screen.getByRole("menu")).toBeVisible());
        act(() => trigger.focus());
        fireEvent.keyDown(trigger, { key });
        expect(screen.getByRole("menuitem", { name: label })).toHaveFocus();
      },
    );

    it("leave focus on the trigger when no item is enabled", async () => {
      const { trigger } = renderTrigger({
        items: [{ key: "paste", label: "Paste", disabled: true }],
      });
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.getByRole("menu")).toBeVisible());
      act(() => trigger.focus());
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      expect(trigger).toHaveFocus();
    });

    it("leave other keys alone", () => {
      const { trigger, panel } = renderTrigger();
      fireEvent.keyDown(trigger, { key: "a" });
      expect(panel.matches(":popover-open")).toBe(false);
    });

    it("run the consumer's onKeyDown first, whose preventDefault skips them", () => {
      const onKeyDown = vi.fn((event: React.KeyboardEvent) =>
        event.preventDefault(),
      );
      const { trigger, panel } = renderTrigger({ onKeyDown });
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(panel.matches(":popover-open")).toBe(false);
    });
  });
});
