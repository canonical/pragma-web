import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Component from "./Button.js";

describe("Button component", () => {
  it("renders", () => {
    render(<Component>Hello world!</Component>);
    expect(screen.getByText("Hello world!")).toBeInTheDocument();
  });

  it("applies className", () => {
    render(<Component className="test-class">Hello world!</Component>);
    expect(screen.getByText("Hello world!")).toHaveClass("test-class");
  });

  it("does not set aria-label for non-string children", () => {
    render(
      <Component>
        <span>Save</span>
      </Component>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).not.toHaveAttribute("aria-label");
  });

  it("attaches shared control paint only to boxed appearances", () => {
    const { rerender } = render(<Component>Save</Component>);
    const button = screen.getByRole("button", { name: "Save" });

    expect(button).toHaveClass(
      "spacing-control-seat",
      "stroke-paint",
      "stroke",
    );

    rerender(<Component appearance="link">Save</Component>);
    expect(button).toHaveClass("link");
    expect(button).not.toHaveClass(
      "spacing-control-seat",
      "stroke-paint",
      "stroke",
    );
  });

  it("preserves native props, click behavior and arbitrary children", () => {
    const onClick = vi.fn();
    render(
      <Component
        aria-label="Run action"
        className="consumer-class"
        data-owner="consumer"
        onClick={onClick}
        style={{ color: "rebeccapurple" }}
      >
        <span>Run</span>
        <span>now</span>
      </Component>,
    );
    const button = screen.getByRole("button", { name: "Run action" });

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(button).toHaveAttribute("data-owner", "consumer");
    expect(button).toHaveClass("consumer-class");
    expect(button.style.color).toBe("rebeccapurple");
    expect(button.children).toHaveLength(2);
  });
});
