import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Component from "./IconButton.js";

describe("IconButton component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("renders a Button with the icon-button class", () => {
      render(<Component icon="edit" aria-label="Edit" />);
      const button = screen.getByRole("button", { name: "Edit" });
      expect(button).toHaveClass("ds", "button", "icon-button");
    });

    it("renders the icon in Button's icon slot and no label", () => {
      const { container } = render(<Component icon="edit" aria-label="Edit" />);
      const button = container.querySelector("button");
      expect(button?.querySelector(":scope > .icon")).toBeInTheDocument();
      expect(button?.querySelector(":scope > .label")).not.toBeInTheDocument();
    });

    it("orders its classes base, Button's modifiers, its own, then the consumer's", () => {
      render(
        <Component
          icon="delete"
          aria-label="Delete"
          importance="tertiary"
          anticipation="destructive"
          className="custom"
        />,
      );
      expect([...screen.getByRole("button").classList]).toEqual([
        "ds",
        "button",
        "tertiary",
        "destructive",
        "icon-button",
        "custom",
      ]);
    });

    it("merges a consumer className", () => {
      render(<Component icon="edit" aria-label="Edit" className="custom" />);
      expect(screen.getByRole("button")).toHaveClass(
        "ds",
        "button",
        "icon-button",
        "custom",
      );
    });
  });

  describe("inherited Button props", () => {
    it("defaults to the primary importance", () => {
      render(<Component icon="edit" aria-label="Edit" />);
      expect(screen.getByRole("button")).toHaveClass("primary");
    });

    it("applies importance and anticipation", () => {
      render(
        <Component
          icon="delete"
          aria-label="Delete"
          importance="tertiary"
          anticipation="destructive"
        />,
      );
      expect(screen.getByRole("button")).toHaveClass("tertiary", "destructive");
    });

    it("can be disabled", () => {
      render(<Component icon="edit" aria-label="Edit" disabled />);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("shows Button's loading state", () => {
      const { container } = render(
        <Component icon="edit" aria-label="Saving" loading />,
      );
      const button = screen.getByRole("button", { name: "Saving" });
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toBeDisabled();
      expect(container.querySelector(".loading-spinner")).toBeInTheDocument();
    });

    it("passes native button attributes and handlers through", () => {
      const onClick = vi.fn();
      render(
        <Component
          icon="edit"
          aria-label="Edit"
          type="submit"
          data-testid="icon-button"
          onClick={onClick}
        />,
      );
      const button = screen.getByTestId("icon-button");
      expect(button).toHaveAttribute("type", "submit");
      button.click();
      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  describe("accessibility", () => {
    it("is named by aria-label", () => {
      render(<Component icon="close" aria-label="Close" />);
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });

    it("is named by aria-labelledby", () => {
      render(
        <>
          <span id="close-label">Close dialog</span>
          <Component icon="close" aria-labelledby="close-label" />
        </>,
      );
      expect(
        screen.getByRole("button", { name: "Close dialog" }),
      ).toBeInTheDocument();
    });

    it("does not trigger Button's missing-name warning", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<Component icon="close" aria-label="Close" />);
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe("tooltip", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    /** Run the Tooltip engine's show or hide delay. */
    const runTooltipDelay = () => {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    };

    /** Hover the button and wait out the delay. */
    const hover = (element: HTMLElement) => {
      fireEvent.pointerEnter(element);
      runTooltipDelay();
    };

    // The cases marked it.fails need the Tooltip pairing, which the next
    // commit adds.
    it.fails("shows the aria-label as the Tooltip's message on hover", () => {
      render(<Component icon="edit" aria-label="Edit" />);
      hover(screen.getByRole("button", { name: "Edit" }));
      expect(screen.getByRole("tooltip")).toHaveTextContent("Edit");
    });

    it.fails("shows the Tooltip on focus", () => {
      render(<Component icon="edit" aria-label="Edit" />);
      act(() => {
        screen.getByRole("button", { name: "Edit" }).focus();
      });
      runTooltipDelay();
      expect(screen.getByRole("tooltip")).toHaveTextContent("Edit");
    });

    it.fails("shows a different message when one is given", () => {
      render(
        <Component
          icon="copy"
          aria-label="Copy"
          // @ts-expect-error the tooltip prop does not exist yet.
          tooltip="Copy the instance address"
        />,
      );
      hover(screen.getByRole("button", { name: "Copy" }));
      expect(screen.getByRole("tooltip")).toHaveTextContent(
        "Copy the instance address",
      );
    });

    it("renders the bare button when the tooltip is false", () => {
      const { container } = render(
        <Component
          icon="edit"
          aria-label="Edit"
          // @ts-expect-error the tooltip prop does not exist yet.
          tooltip={false}
        />,
      );
      expect(container.querySelector(".tooltip-area")).not.toBeInTheDocument();
      expect(container.firstElementChild?.tagName).toBe("BUTTON");
    });

    it.fails("shows no Tooltip and warns once when named only by aria-labelledby", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { container, rerender } = render(
        <>
          <span id="close-label">Close dialog</span>
          <Component icon="close" aria-labelledby="close-label" />
        </>,
      );
      rerender(
        <>
          <span id="close-label">Close dialog</span>
          <Component icon="close" aria-labelledby="close-label" />
        </>,
      );
      expect(container.querySelector(".tooltip-area")).not.toBeInTheDocument();
      expect(warn).toHaveBeenCalledOnce();
      expect(warn.mock.calls[0]?.[0]).toMatch(/IconButton/);
    });

    it("leaves the button's accessible description empty", () => {
      // The Tooltip engine puts aria-describedby on its own wrapper span, not
      // on the button, so the message is never read as the description.
      render(<Component icon="edit" aria-label="Edit" />);
      const button = screen.getByRole("button", { name: "Edit" });
      hover(button);
      expect(button).toHaveAccessibleDescription("");
      expect(button).not.toHaveAttribute("aria-describedby");
    });

    it.fails("stays closed while the button's panel is expanded", () => {
      const { rerender } = render(
        <Component
          icon="settings"
          aria-label="Settings"
          aria-expanded="true"
        />,
      );
      const button = screen.getByRole("button", { name: "Settings" });
      hover(button);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      rerender(
        <Component
          icon="settings"
          aria-label="Settings"
          aria-expanded="false"
        />,
      );
      fireEvent.pointerLeave(button);
      runTooltipDelay();
      hover(button);
      expect(screen.getByRole("tooltip")).toHaveTextContent("Settings");
    });

    it.fails("hides on Escape", () => {
      render(<Component icon="edit" aria-label="Edit" />);
      hover(screen.getByRole("button", { name: "Edit" }));
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
      fireEvent.keyDown(document, { key: "Escape" });
      runTooltipDelay();
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });
});
