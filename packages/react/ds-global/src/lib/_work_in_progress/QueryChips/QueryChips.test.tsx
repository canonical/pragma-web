import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Component from "./QueryChips.js";

describe("QueryChips", () => {
  it("is a list named by its label, one item per child", () => {
    render(
      <Component label="Filters">
        <span key="a">status</span>
        <span key="b">cpu</span>
      </Component>,
    );
    const list = screen.getByRole("list", { name: "Filters" });
    expect(list.tagName).toBe("UL");
    expect(list).toHaveAttribute("role", "list");
    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual(["status", "cpu"]);
  });

  it("is named by aria-labelledby", () => {
    render(
      <>
        <h2 id="heading">Applied filters</h2>
        <Component aria-labelledby="heading">
          <span>status</span>
        </Component>
      </>,
    );
    expect(screen.getByRole("list")).toHaveAccessibleName("Applied filters");
    expect(screen.getByRole("list")).not.toHaveAttribute("aria-label");
  });

  it("drops empty children and keeps text children", () => {
    render(
      <Component label="Filters">
        {false}
        {null}
        text
        <span>status</span>
      </Component>,
    );
    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual(["text", "status"]);
  });

  it("merges its class and forwards native props", () => {
    render(
      <Component label="Filters" className="mine" data-testid="chips">
        <span>status</span>
      </Component>,
    );
    const list = screen.getByTestId("chips");
    expect(list.className).toBe("ds query-chips mine");
    expect(list).not.toHaveAttribute("label");
  });
});
