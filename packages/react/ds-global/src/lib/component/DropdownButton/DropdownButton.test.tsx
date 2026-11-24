import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { installPopoverStandIn } from "../../../../testing/index.js";
import type { MenuEntry } from "../ContextualMenu/index.js";
import Component from "./DropdownButton.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const items: MenuEntry[] = [
  { key: "rename", label: "Rename" },
  { url: "#docs", label: "Docs" },
];

type Props = Partial<ComponentProps<typeof Component>>;

/** Renders a DropdownButton labelled "Actions" over `items`. */
const renderButton = (props: Props = {}) => {
  const result = render(
    <Component items={items} {...props}>
      Actions
    </Component>,
  );
  const button = screen.getByRole("button") as HTMLElement;
  return {
    ...result,
    button,
    popover: button.nextElementSibling as HTMLElement,
  };
};

describe("DropdownButton", () => {
  describe("the button", () => {
    it("is a Button with a decorative chevron trailing its label", () => {
      const { button } = renderButton({ importance: "secondary" });
      expect(button.className).toBe(
        "ds button secondary ds contextual-menu-trigger ds dropdown-button",
      );
      expect(button).toHaveAttribute("type", "button");
      const label = screen.getByText("Actions");
      expect(label).toHaveClass("label");
      const chevron = label.lastElementChild as HTMLElement;
      expect(chevron).toHaveClass("chevron");
      expect(chevron.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(chevron.querySelector("use")?.getAttribute("href")).toContain(
        "chevron-down",
      );
    });

    it("keeps the consumer's props, class, style and type", () => {
      const { button } = renderButton({
        id: "actions",
        className: "active",
        style: { marginInlineStart: "1rem" },
        type: "submit",
        disabled: true,
        "data-active": true,
      } as Props);
      expect(button.id).toBe("actions");
      expect(button.className).toBe(
        "ds button primary ds contextual-menu-trigger ds dropdown-button active",
      );
      expect(button.style.marginInlineStart).toBe("1rem");
      expect(button.style.getPropertyValue("anchor-name")).toMatch(/^--/);
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("data-active", "true");
    });

    it("leaves a count in the children part of the name", () => {
      render(
        <Component items={items}>
          Status <span className="count">2</span>
        </Component>,
      );
      expect(screen.getByRole("button", { name: "Status 2" })).toBeVisible();
    });
  });

  describe("the menu", () => {
    it("opens from the button, named by it", async () => {
      const { button, popover } = renderButton();
      expect(button).toHaveAttribute("aria-haspopup", "menu");
      expect(button).toHaveAttribute("popovertarget", popover.id);
      fireEvent.click(button);
      await waitFor(() =>
        expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus(),
      );
      expect(screen.getByRole("menu")).toHaveAttribute(
        "aria-labelledby",
        button.id,
      );
    });

    it("names the menu by ids, over a label", async () => {
      render(<span id="heading">Machine actions</span>);
      const { button } = renderButton({
        menuLabelledBy: "heading",
        menuLabel: "x",
      });
      fireEvent.click(button);
      expect(
        await screen.findByRole("menu", { name: "Machine actions" }),
      ).not.toHaveAttribute("aria-label");
    });

    it("calls onSelect with the item and the click, then closes", async () => {
      const onSelect = vi.fn();
      const { button, popover } = renderButton({ onSelect });
      fireEvent.click(button);
      fireEvent.click(await screen.findByRole("menuitem", { name: "Rename" }));
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ key: "rename" }),
        expect.objectContaining({ type: "click" }),
      );
      await waitFor(() => expect(popover.matches(":popover-open")).toBe(false));
    });

    it("opens on ArrowDown, after the consumer's onKeyDown", async () => {
      const onKeyDown = vi.fn();
      const { button, popover } = renderButton({ onKeyDown });
      fireEvent.keyDown(button, { key: "ArrowDown" });
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(popover.matches(":popover-open")).toBe(true);
      await waitFor(() =>
        expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus(),
      );
    });

    it("lets the consumer's preventDefault skip the arrows", () => {
      const { button, popover } = renderButton({
        onKeyDown: (event) => event.preventDefault(),
      });
      fireEvent.keyDown(button, { key: "ArrowDown" });
      expect(popover.matches(":popover-open")).toBe(false);
    });

    it("cannot open while disabled or loading", () => {
      render(
        <>
          <Component items={items} disabled>
            Disabled
          </Component>
          <Component items={items} loading>
            Loading
          </Component>
        </>,
      );
      for (const button of screen.getAllByRole("button", { hidden: true })) {
        act(() => button.click());
      }
      expect(document.querySelector(":popover-open")).toBeNull();
    });
  });

  describe("the name warning", () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
    });

    it.each([undefined, false, ""])(
      "warns when a button with %j children has no name",
      (children) => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        render(
          <Component items={items} icon="filter">
            {children}
          </Component>,
        );
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining(
            "DropdownButton: a button with no visible children",
          ),
        );
      },
    );

    it("stays quiet when the button is named or labelled", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        <>
          <Component items={items}>View</Component>
          <Component items={items} icon="filter" aria-label="Filter" />
          <Component items={items} icon="filter" aria-labelledby="label" />
        </>,
      );
      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining("DropdownButton"),
      );
    });

    it("stays quiet in production", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.stubEnv("NODE_ENV", "production");
      render(<Component items={items} icon="filter" />);
      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining("DropdownButton"),
      );
    });
  });
});
