import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  beforeMain,
  grid,
  gridSpanAll,
  renderServerMarkup,
  rtl,
  rtlDocument,
  surfaces,
} from "./decorators.js";

const Story = () => <p>Story</p>;

describe("renderServerMarkup", () => {
  it("renders the story's server markup with no React attached", () => {
    const onClick = vi.fn();
    const Button = () => (
      <button type="button" onClick={onClick}>
        Press
      </button>
    );
    const Decorated = () => renderServerMarkup()(Button);
    render(<Decorated />);
    fireEvent.click(screen.getByRole("button", { name: "Press" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("rtl", () => {
  it("wraps the story in a right-to-left element", () => {
    const Decorated = () => rtl()(Story);
    render(<Decorated />);
    expect(screen.getByText("Story").parentElement).toHaveAttribute(
      "dir",
      "rtl",
    );
  });
});

describe("rtlDocument", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("dir");
  });

  it("sets the document right-to-left while the story shows, then restores it", () => {
    document.documentElement.dir = "ltr";
    const Decorated = () => rtlDocument()(Story, { viewMode: "story" });
    const { unmount } = render(<Decorated />);
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    unmount();
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("leaves the document alone on a docs page", () => {
    const Decorated = () => rtlDocument()(Story, { viewMode: "docs" });
    render(<Decorated />);
    expect(document.documentElement.dir).toBe("");
    expect(screen.getByText("Story")).toBeInTheDocument();
  });
});

describe("gridSpanAll", () => {
  it("spans every column", () => {
    expect(gridSpanAll).toEqual({ gridColumn: "1 / -1" });
  });
});

describe("surfaces", () => {
  it("renders the content at three nested surface levels", () => {
    render(surfaces((level) => <p>Level {level}</p>));
    const deepest = screen.getByText("Level 2");
    expect(deepest.closest(".surface .surface .surface")).not.toBeNull();
    expect(screen.getByText("Level 0")).toBeInTheDocument();
  });
});

describe("grid", () => {
  it("wraps the story in a grid", () => {
    const Decorated = () => grid()(Story);
    render(<Decorated />);
    expect(screen.getByText("Story").parentElement).toHaveClass("grid");
  });
});

describe("beforeMain", () => {
  it("places the story before a main element with the given id", () => {
    const Decorated = () => beforeMain({ id: "content" })(Story);
    render(<Decorated />);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "content");
    expect(
      screen.getByText("Story").compareDocumentPosition(main) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
