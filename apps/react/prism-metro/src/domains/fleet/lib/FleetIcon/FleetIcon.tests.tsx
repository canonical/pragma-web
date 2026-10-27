import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FleetIcon from "./FleetIcon.js";

describe("FleetIcon", () => {
  it("draws two cars, hidden from assistive technology", () => {
    const { container } = render(<FleetIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("ds", "fleet-icon");
    expect(svg?.querySelectorAll("path.car")).toHaveLength(2);
  });

  it("passes native props through and keeps itself hidden", () => {
    const { container } = render(
      <FleetIcon className="x" data-testid="icon" height="24" width="24" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("x");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("data-testid", "icon");
  });
});
