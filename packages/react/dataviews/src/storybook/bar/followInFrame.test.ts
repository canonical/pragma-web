import { describe, expect, it, vi } from "vitest";
import followInFrame from "./followInFrame.js";

describe("followInFrame", () => {
  it("navigates the frame to the address as its query", () => {
    const assign = vi.fn();
    followInFrame("?status=deployed", {
      href: "http://localhost/iframe.html?id=bar--x&status=a",
      assign,
    });
    expect(String(assign.mock.calls[0]?.[0])).toBe(
      "http://localhost/iframe.html?id=bar--x&query=status%3Ddeployed",
    );
  });

  it("navigates the window's own frame by default", () => {
    expect(() => followInFrame("?q=web")).not.toThrow();
  });
});
