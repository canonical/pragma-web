import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

  describe("root", () => {
    it("renders the <button> as its root, with no Tooltip area", () => {
      const { container } = render(<Component icon="edit" aria-label="Edit" />);
      expect(container.firstElementChild?.tagName).toBe("BUTTON");
      expect(container.querySelector(".tooltip-area")).not.toBeInTheDocument();
    });

    it("puts the consumer's className and style on the root", () => {
      const { container } = render(
        <Component
          icon="edit"
          aria-label="Edit"
          className="custom"
          style={{ marginInlineStart: "auto" }}
        />,
      );
      const root = container.firstElementChild;
      expect(root).toBeInstanceOf(HTMLElement);
      if (!(root instanceof HTMLElement)) return;
      expect(root).toHaveClass("custom");
      expect(root.style.marginInlineStart).toBe("auto");
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

  describe("as a trigger", () => {
    it("passes the popover and menu attributes, style and ref to the root button", () => {
      const ref = createRef<HTMLButtonElement>();
      const { container } = render(
        <Component
          ref={ref}
          icon="menu-contextual"
          aria-label="Row options"
          importance="tertiary"
          popoverTarget="row-options"
          popoverTargetAction="toggle"
          aria-haspopup="menu"
          aria-expanded={false}
          aria-controls="row-options"
          style={{ marginInlineStart: "auto" }}
        />,
      );
      const button = screen.getByRole("button", { name: "Row options" });
      expect(button).toHaveAttribute("popovertarget", "row-options");
      expect(button).toHaveAttribute("popovertargetaction", "toggle");
      expect(button).toHaveAttribute("aria-haspopup", "menu");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute("aria-controls", "row-options");
      expect(button.style.marginInlineStart).toBe("auto");
      expect(ref.current).toBe(button);
      expect(container.firstElementChild).toBe(button);
    });
  });
});
