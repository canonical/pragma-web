import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

  it("merges className with the component class", () => {
    render(<Component className="test-class">Hello world!</Component>);
    const button = screen.getByText("Hello world!").closest("button");

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("ds", "button", "test-class");
  });

  it("forwards native props to the button root", () => {
    render(
      <Component data-testid="button" aria-describedby="hint">
        Hello world!
      </Component>,
    );
    const button = screen.getByTestId("button");

    expect(button).toHaveAttribute("aria-describedby", "hint");
    expect(button.tagName).toBe("BUTTON");
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
});
