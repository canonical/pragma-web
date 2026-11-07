import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import surfaces from "./surfaces.js";

describe("surfaces", () => {
  it("stacks three nested surface bands across every column", () => {
    const { container } = render(
      surfaces((level: number) => <span>Level {level}</span>),
    );
    expect(container.querySelectorAll(".surface")).toHaveLength(3);
    expect(
      screen.getByText("Level 2").closest(".surface .surface .surface"),
    ).not.toBeNull();
    const root = container.firstElementChild;
    expect(root).toBeInstanceOf(HTMLElement);
    if (!(root instanceof HTMLElement)) return;
    expect(root.style.gridColumn).toBe("1 / -1");
  });
});
