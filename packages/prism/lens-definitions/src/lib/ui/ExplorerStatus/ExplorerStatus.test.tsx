/**
 * The status figure, as a pure projection of its props: its numbers agree
 * with the counts it is given, so the figure can never flatter the graph.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExplorerStatus from "./ExplorerStatus.js";

describe("ExplorerStatus", () => {
  it("states the proportion in words, not only as a bar", () => {
    render(<ExplorerStatus abstract={4} total={29} visible={17} />);
    // The caption is the accessible channel; the bar is glanceable only.
    expect(screen.getByRole("figure").textContent).toContain(
      "17 of 29 classes",
    );
    expect(screen.getByRole("figure").textContent).toContain("4 abstract");
  });

  it("omits the abstract clause when nothing abstract is showing", () => {
    render(<ExplorerStatus abstract={0} total={29} visible={25} />);
    expect(screen.getByRole("figure").textContent).toContain(
      "25 of 29 classes",
    );
    expect(screen.getByRole("figure").textContent).not.toContain("abstract");
  });

  it("names the figure by its full sentence beside its short form", () => {
    render(<ExplorerStatus abstract={5} total={66} visible={66} />);
    const figure = screen.getByRole("figure", {
      name: "66 of 66 classes · 5 abstract",
    });
    expect(figure.querySelector(".full")?.textContent).toBe(
      "66 of 66 classes · 5 abstract",
    );
    expect(figure.querySelector(".short")?.textContent).toBe("66 classes");
  });

  it("shortens the count to the shown figure and its noun", () => {
    render(<ExplorerStatus abstract={0} total={66} visible={1} />);
    const figure = screen.getByRole("figure", { name: "1 of 66 classes" });
    expect(figure.querySelector(".full")?.textContent).toBe("1 of 66 classes");
    expect(figure.querySelector(".short")?.textContent).toBe("1 class");
  });

  it("survives the degenerate empty graph without dividing by zero", () => {
    render(<ExplorerStatus abstract={0} total={0} visible={0} />);
    expect(screen.getByRole("figure").textContent).toContain("0 of 0 classes");
  });

  it("announces politely — the count changes as chips move", () => {
    render(<ExplorerStatus abstract={1} total={29} visible={17} />);
    expect(screen.getByRole("figure")).toHaveAttribute("aria-live", "polite");
  });

  it("merges a class name and passes native props to its root", () => {
    render(
      <ExplorerStatus
        abstract={0}
        className="custom-class"
        data-testid="status"
        total={2}
        visible={1}
      />,
    );
    expect(screen.getByTestId("status").className).toBe(
      "ds explorer-status custom-class",
    );
  });
});
