import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import Context from "../Context.js";
import Component from "./Dismiss.js";

// Provides the chip's context directly, so these tests don't depend on Chip.
const renderInChip = (ui: ReactElement) =>
  render(
    <Context.Provider value={{ defaultDismissLabel: "Dismiss Owner: Bob" }}>
      {ui}
    </Context.Provider>,
  );

describe("Chip.Dismiss", () => {
  describe("accessible name", () => {
    // The default label is covered by Chip's tests ("names it after the lead
    // and value"); here only the override is tested.
    it("accepts an aria-label override", () => {
      renderInChip(<Component onClick={vi.fn()} aria-label="Remove Bob" />);

      expect(
        screen.getByRole("button", { name: "Remove Bob" }),
      ).toBeInTheDocument();
    });
  });

  describe("behaviour", () => {
    it("calls onClick when activated", () => {
      const onClick = vi.fn();
      renderInChip(<Component onClick={onClick} />);
      fireEvent.click(screen.getByRole("button"));

      expect(onClick).toHaveBeenCalledOnce();
    });

    it("does not call onClick when disabled", () => {
      const onClick = vi.fn();
      renderInChip(<Component onClick={onClick} disabled />);
      fireEvent.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toBeDisabled();
      expect(onClick).not.toHaveBeenCalled();
    });

    it("defaults to a non-submitting button", () => {
      renderInChip(<Component onClick={vi.fn()} />);

      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("accepts a native type override", () => {
      renderInChip(<Component onClick={vi.fn()} type="submit" />);

      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });
  });

  describe("attributes", () => {
    it("orders the base and consumer classes", () => {
      renderInChip(<Component onClick={vi.fn()} className="custom" />);

      expect(screen.getByRole("button").className).toBe(
        "ds chip-dismiss custom",
      );
    });

    it("forwards native props", () => {
      renderInChip(<Component onClick={vi.fn()} title="Remove" />);

      expect(screen.getByRole("button")).toHaveAttribute("title", "Remove");
    });
  });

  describe("content", () => {
    it("renders the close icon", () => {
      renderInChip(<Component onClick={vi.fn()} />);

      expect(screen.getByRole("button").querySelector("use")).toHaveAttribute(
        "href",
        "/icons/close.svg#close",
      );
    });
  });

  describe("validation", () => {
    it("throws outside a chip", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<Component onClick={vi.fn()} />)).toThrow(
        "Chip.Dismiss must be used within a Chip.",
      );
    });
  });
});
