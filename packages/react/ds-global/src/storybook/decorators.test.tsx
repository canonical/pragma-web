import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { beforeMain, contrasted, grid, rtl, surface } from "./decorators.js";

const Story = () => <p>Story</p>;

describe("rtl", () => {
  it("renders the story right-to-left", () => {
    const Decorated = () => rtl()(Story);
    render(<Decorated />);
    expect(screen.getByText("Story").parentElement).toHaveAttribute(
      "dir",
      "rtl",
    );
  });
});

describe("surface", () => {
  it("renders the story inside a .surface", () => {
    const Decorated = () => surface()(Story);
    render(<Decorated />);
    expect(screen.getByText("Story").parentElement).toHaveClass("surface");
  });
});

describe("contrasted", () => {
  it("renders the story inside a .contrasted", () => {
    const Decorated = () => contrasted()(Story);
    render(<Decorated />);
    expect(screen.getByText("Story").parentElement).toHaveClass("contrasted");
  });
});

describe("grid", () => {
  it("renders the story inside a .grid", () => {
    const Decorated = () => grid()(Story);
    render(<Decorated />);
    expect(screen.getByText("Story").parentElement).toHaveClass("grid");
  });
});

describe("beforeMain", () => {
  it("renders the story before a main with the given id and children", () => {
    const Decorated = () =>
      beforeMain({ id: "content", children: "Main content" })(Story);
    render(<Decorated />);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "content");
    expect(main).toHaveTextContent("Main content");
    expect(
      screen.getByText("Story").compareDocumentPosition(main) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("defaults the main id to main", () => {
    const Decorated = () => beforeMain({})(Story);
    render(<Decorated />);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
  });
});
