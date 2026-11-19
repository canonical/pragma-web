import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import renderOnSurfaces from "./renderOnSurfaces.js";

describe("renderOnSurfaces", () => {
  it("renders three nested .surface bands", () => {
    const { container } = render(renderOnSurfaces(() => null));
    expect(container.querySelectorAll(".surface")).toHaveLength(3);
    expect(
      container.querySelectorAll(".surface .surface .surface"),
    ).toHaveLength(1);
  });

  it("renders the component once per level", () => {
    const renderAtLevel = vi.fn((level: number) => <p>Level {level}</p>);
    render(renderOnSurfaces(renderAtLevel));
    expect(renderAtLevel.mock.calls.map(([level]) => level)).toEqual([0, 1, 2]);
    expect(screen.getByText("Level 2")).toBeInTheDocument();
  });
});
