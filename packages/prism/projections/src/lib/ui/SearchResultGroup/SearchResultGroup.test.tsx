// Scaffolded by @canonical/summon-component:react v0.46.0

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SearchResultGroup from "./SearchResultGroup.js";

describe("SearchResultGroup", () => {
  it("heads its rows with the type and its count, named by the type", () => {
    render(
      <SearchResultGroup count={6} title="Component">
        <li>SidePanel</li>
        <li>Button</li>
      </SearchResultGroup>,
    );
    const group = screen.getByRole("region", { name: "Component" });
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Component · 6",
    );
    expect(group.querySelectorAll("ol > li")).toHaveLength(2);
  });

  it("keeps a caller's class on its root", () => {
    render(
      <SearchResultGroup className="g" count={1} title="Class">
        <li>Subcomponent</li>
      </SearchResultGroup>,
    );
    expect(screen.getByRole("region")).toHaveClass("search-result-group", "g");
  });
});
