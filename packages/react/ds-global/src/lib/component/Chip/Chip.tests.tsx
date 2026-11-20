import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Component from "./Chip.js";
import type { ChipProps } from "./types.js";

describe("Chip component", () => {
  describe("action chip", () => {
    it("renders as a non-submitting button named by its text", () => {
      render(<Component lead="Owner" value="Bob" onClick={vi.fn()} />);
      const chip = screen.getByRole("button", { name: "Owner: Bob" });

      expect(chip).toHaveAttribute("type", "button");
      expect(chip).toHaveClass("ds", "chip");
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    it("accepts a native type override", () => {
      render(<Component value="Ubuntu" onClick={vi.fn()} type="submit" />);

      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("calls onClick when activated", () => {
      const onClick = vi.fn();
      render(<Component value="Ubuntu" onClick={onClick} />);
      fireEvent.click(screen.getByRole("button"));

      expect(onClick).toHaveBeenCalledOnce();
    });

    it("does not call onClick when disabled", () => {
      const onClick = vi.fn();
      render(<Component value="Ubuntu" onClick={onClick} disabled />);
      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toBeDisabled();
      expect(onClick).not.toHaveBeenCalled();
    });

    it("forwards native props to the button root", () => {
      const onMouseEnter = vi.fn();
      render(
        <Component
          value="Ubuntu"
          onClick={vi.fn()}
          onMouseEnter={onMouseEnter}
          aria-describedby="hint"
        />,
      );
      const chip = screen.getByRole("button");
      fireEvent.mouseEnter(chip);

      expect(chip).toHaveAttribute("aria-describedby", "hint");
      expect(onMouseEnter).toHaveBeenCalledOnce();
    });
  });

  describe("dismissible chip", () => {
    it("renders as a span whose only action is the dismiss control", () => {
      render(
        <Component lead="Owner" value="Bob" data-testid="chip">
          <Component.Dismiss onClick={vi.fn()} />
        </Component>,
      );
      const chip = screen.getByTestId("chip");

      expect(chip.tagName).toBe("SPAN");
      expect(chip).toHaveClass("ds", "chip");
      expect(screen.getAllByRole("button")).toHaveLength(1);
      expect(chip).toContainElement(screen.getByRole("button"));
    });

    it("forwards native props to the span root", () => {
      render(
        <Component value="Bob" data-testid="chip" aria-describedby="hint">
          <Component.Dismiss onClick={vi.fn()} />
        </Component>,
      );

      expect(screen.getByTestId("chip")).toHaveAttribute(
        "aria-describedby",
        "hint",
      );
    });
  });

  describe("dismiss control", () => {
    it("names it after the lead and value", () => {
      render(
        <Component lead="Owner" value="Bob">
          <Component.Dismiss onClick={vi.fn()} />
        </Component>,
      );

      expect(
        screen.getByRole("button", { name: "Dismiss Owner: Bob" }),
      ).toBeInTheDocument();
    });

    it("names it after the value alone without a lead", () => {
      render(
        <Component value="Ubuntu">
          <Component.Dismiss onClick={vi.fn()} />
        </Component>,
      );

      expect(
        screen.getByRole("button", { name: "Dismiss Ubuntu" }),
      ).toBeInTheDocument();
    });

    it("renames it when the chip's text changes", () => {
      const { rerender } = render(
        <Component value="Bob">
          <Component.Dismiss onClick={vi.fn()} />
        </Component>,
      );
      rerender(
        <Component value="Alice">
          <Component.Dismiss onClick={vi.fn()} />
        </Component>,
      );

      expect(
        screen.getByRole("button", { name: "Dismiss Alice" }),
      ).toBeInTheDocument();
    });
  });

  describe("content", () => {
    it("renders the lead with its colon before the value", () => {
      render(<Component lead="Owner" value="Bob" onClick={vi.fn()} />);

      expect(screen.getByText("Owner:")).toHaveClass("lead");
      expect(screen.getByText("Bob")).toHaveClass("value");
    });

    it("renders a design-system icon before the text", () => {
      render(<Component value="Archive" icon="archive" onClick={vi.fn()} />);
      const icon = screen.getByRole("button").querySelector(".icon > svg");

      expect(icon).toHaveAttribute("aria-hidden", "true");
      expect(icon?.querySelector("use")).toHaveAttribute(
        "href",
        "/icons/archive.svg#archive",
      );
    });

    it("renders the badge after the value", () => {
      render(
        <Component
          value="Projects"
          badge={<span data-testid="badge">3</span>}
          onClick={vi.fn()}
        />,
      );
      const badge = screen.getByTestId("badge");

      expect(badge.parentElement).toHaveClass("badge");
      expect(screen.getByText("Projects").nextElementSibling).toBe(
        badge.parentElement,
      );
    });
  });

  describe("title", () => {
    it("exposes the lead and value as a native tooltip", () => {
      render(<Component lead="Owner" value="Bob" onClick={vi.fn()} />);

      expect(screen.getByRole("button")).toHaveAttribute("title", "Owner: Bob");
    });

    it("uses the value alone without a lead", () => {
      render(<Component value="Ubuntu" onClick={vi.fn()} />);

      expect(screen.getByRole("button")).toHaveAttribute("title", "Ubuntu");
    });

    it("accepts a native title override", () => {
      render(
        <Component value="Ubuntu" title="Distribution" onClick={vi.fn()} />,
      );

      expect(screen.getByRole("button")).toHaveAttribute(
        "title",
        "Distribution",
      );
    });
  });

  describe("classes", () => {
    it("orders the base, criticality and consumer classes", () => {
      render(
        <Component
          value="Running"
          criticality="success"
          className="custom"
          onClick={vi.fn()}
        />,
      );

      expect(screen.getByRole("button").className).toBe(
        "ds chip success custom",
      );
    });
  });

  describe("design-system props", () => {
    it.each([
      ["button", { onClick: vi.fn() }],
      ["span", { children: <Component.Dismiss onClick={vi.fn()} /> }],
    ] as const)("do not leak to the DOM from the %s root", (_, action) => {
      const props = {
        lead: "Owner",
        value: "Bob",
        icon: "user",
        badge: <span>3</span>,
        criticality: "success",
        ...action,
      } as ChipProps;
      render(<Component {...props} data-testid="chip" />);
      const chip = screen.getByTestId("chip");

      for (const leaked of ["lead", "value", "icon", "badge", "criticality"]) {
        expect(chip).not.toHaveAttribute(leaked);
      }
    });
  });
});
