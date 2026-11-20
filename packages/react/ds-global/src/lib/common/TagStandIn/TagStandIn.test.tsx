import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TagStandIn from "./TagStandIn.js";

describe("TagStandIn", () => {
  it("renders a span as its root", () => {
    const { container } = render(<TagStandIn value="Bob" />);
    const tag = container.firstElementChild;

    expect(tag).not.toBeNull();
    expect(tag?.tagName).toBe("SPAN");
    expect(tag).toHaveClass("ds", "tag");
  });

  it("renders the lead before the value", () => {
    render(<TagStandIn lead="Owner" value="Bob" />);
    const lead = screen.getByText("Owner");
    const value = screen.getByText("Bob");

    expect(lead).toHaveClass("lead");
    expect(value).toHaveClass("value");
    expect(lead.nextElementSibling).toBe(value);
  });

  it("renders the value alone without a lead", () => {
    const { container } = render(<TagStandIn value="Bob" />);

    expect(container.querySelector(".lead")).toBeNull();
    expect(screen.getByText("Bob")).toHaveClass("value");
  });

  it("orders its own class, the criticality and the consumer's", () => {
    const { container } = render(
      <TagStandIn value="Bob" criticality="success" className="custom" />,
    );

    expect(container.firstElementChild?.className).toBe(
      "ds tag success custom",
    );
  });

  it("passes every other prop to the span", () => {
    render(<TagStandIn value="Bob" data-testid="stand-in" title="Owner" />);

    expect(screen.getByTestId("stand-in")).toHaveAttribute("title", "Owner");
  });
});
