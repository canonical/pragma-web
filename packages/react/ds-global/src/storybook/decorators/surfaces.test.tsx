import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("surfaces", () => {
  // Fails until surfaces moves to its own module.
  it.fails("stacks three nested surface bands across every column", async () => {
    // A computed path, so the bundler does not resolve the missing module.
    const modulePath = "./surfaces.js";
    const { default: surfaces } = await import(/* @vite-ignore */ modulePath);
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
