// Scaffolded by @canonical/summon-component:react v0.46.0

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SearchPassage from "./SearchPassage.js";

describe("SearchPassage", () => {
  it("shows the passage whole with each range marked", () => {
    const { container } = render(
      <SearchPassage
        passage="… focus moves in but is never trapped."
        ranges={[{ start: 17, length: 3 }]}
      />,
    );
    const root = container.firstElementChild;
    expect(root).toHaveClass("ds", "search-passage");
    expect(root).toHaveTextContent("… focus moves in but is never trapped.");
    expect(container.querySelector("mark")).toHaveTextContent("but");
  });

  it("keeps a caller's class and props on its root", () => {
    const { container } = render(
      <SearchPassage
        className="x"
        data-item="passage"
        passage="p"
        ranges={[]}
      />,
    );
    expect(container.firstElementChild).toHaveClass("search-passage", "x");
    expect(container.firstElementChild).toHaveAttribute("data-item", "passage");
  });
});
