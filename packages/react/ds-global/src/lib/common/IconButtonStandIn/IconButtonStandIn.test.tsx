import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import IconButtonStandIn from "./IconButtonStandIn.js";

describe("IconButtonStandIn", () => {
  it("renders the <button> as its root, named by its label", () => {
    const { container } = render(
      <IconButtonStandIn icon="settings" aria-label="Settings" />,
    );
    const button = screen.getByRole("button", { name: "Settings" });
    expect(container.firstElementChild).toBe(button);
  });

  it("carries Button's classes, then its own, then the consumer's", () => {
    render(
      <IconButtonStandIn
        icon="settings"
        importance="tertiary"
        aria-label="Settings"
        className="close"
      />,
    );
    expect(screen.getByRole("button").className).toBe(
      "ds button tertiary ds icon-button close",
    );
  });

  it("passes every other prop to the button", () => {
    render(
      <IconButtonStandIn
        icon="close"
        aria-labelledby="label"
        type="button"
        data-testid="stand-in"
        popoverTarget="panel"
      />,
    );
    const button = screen.getByTestId("stand-in");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-labelledby", "label");
    expect(button).toHaveAttribute("popovertarget", "panel");
    expect(button.querySelector(".icon svg")).not.toBeNull();
  });

  it("renders no label", () => {
    render(<IconButtonStandIn icon="settings" aria-label="Settings" />);
    expect(screen.getByRole("button").querySelector(".label")).toBeNull();
  });
});
