import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Content from "./Content.js";

/*
  jsdom performs no layout, so every box measures 0 and the overflow state
  could never leave its resting answer. Serve the pane's metrics through
  prototype getters that shadow jsdom's always-zero ones instead; `scrollTop`
  is set per element by the scroll helper below.
*/
let layout = { clientHeight: 200, scrollHeight: 200 };

/** Move the pane's scroll offset and fire the event a real scroll would. */
const scrollTo = (element: HTMLElement, scrollTop: number): void => {
  Object.defineProperty(element, "scrollTop", {
    value: scrollTop,
    writable: true,
    configurable: true,
  });
  act(() => {
    element.dispatchEvent(new Event("scroll"));
  });
};

beforeEach(() => {
  layout = { clientHeight: 200, scrollHeight: 200 };
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: () => layout.clientHeight,
  });
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get: () => layout.scrollHeight,
  });
});

afterEach(() => {
  // Deleting the own properties unshadows jsdom's originals on Element.prototype.
  Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
  Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
});

describe("SidePanel.Content", () => {
  it("renders children", () => {
    render(<Content>Test content</Content>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("applies the base and custom class", () => {
    render(<Content className="custom-class">Body</Content>);
    const element = screen.getByText("Body");
    expect(element.className).toContain("ds side-panel-content");
    expect(element.className).toContain("custom-class");
  });

  it("adds the fill class when fill is set", () => {
    render(<Content fill>Body</Content>);
    expect(screen.getByText("Body").className).toContain("fill");
  });

  it("keeps its natural height by default", () => {
    render(<Content>Body</Content>);
    expect(screen.getByText("Body").className).not.toContain("fill");
  });

  it("passes through additional props", () => {
    render(<Content data-testid="test-component">Body</Content>);
    expect(screen.getByTestId("test-component")).toBeInTheDocument();
  });

  describe("overflow lines", () => {
    it("marks itself driven once JavaScript mounts", () => {
      // The marker disables the no-JavaScript CSS fallback; it appears only
      // after the client effect runs, and never in server markup (the SSR
      // suite asserts the absence).
      render(<Content>Body</Content>);
      expect(screen.getByText("Body")).toHaveAttribute("data-overflow-driven");
    });

    it("marks no edge while the content fits", () => {
      render(<Content>Body</Content>);
      const pane = screen.getByText("Body");
      expect(pane).not.toHaveAttribute("data-overflow-top");
      expect(pane).not.toHaveAttribute("data-overflow-bottom");
    });

    it("marks the bottom edge on mount when the content is taller than the pane", () => {
      layout = { clientHeight: 200, scrollHeight: 600 };
      render(<Content>Body</Content>);
      const pane = screen.getByText("Body");
      expect(pane).not.toHaveAttribute("data-overflow-top");
      expect(pane).toHaveAttribute("data-overflow-bottom");
    });

    it("marks both edges mid-scroll", () => {
      layout = { clientHeight: 200, scrollHeight: 600 };
      render(<Content>Body</Content>);
      const pane = screen.getByText("Body");
      scrollTo(pane, 100);
      expect(pane).toHaveAttribute("data-overflow-top");
      expect(pane).toHaveAttribute("data-overflow-bottom");
    });

    it("drops the bottom edge once the pane bottoms out", () => {
      layout = { clientHeight: 200, scrollHeight: 600 };
      render(<Content>Body</Content>);
      const pane = screen.getByText("Body");
      scrollTo(pane, 400);
      expect(pane).toHaveAttribute("data-overflow-top");
      expect(pane).not.toHaveAttribute("data-overflow-bottom");
    });

    it("keeps feeding a consumer ref alongside its own measurement", () => {
      const ref = createRef<HTMLDivElement>();
      render(<Content ref={ref}>Body</Content>);
      expect(ref.current).toBe(screen.getByText("Body"));
    });
  });
});
