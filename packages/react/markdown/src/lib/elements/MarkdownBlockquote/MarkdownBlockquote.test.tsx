import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MarkdownBlockquote from "./MarkdownBlockquote.js";

describe("MarkdownBlockquote", () => {
  it("renders an admonition as an announcement headed by its label", () => {
    const { container } = render(
      <MarkdownBlockquote data-admonition="warning" node={{}}>
        Mind the gap.
      </MarkdownBlockquote>,
    );

    const announcement = container.querySelector(".ds.announcement");
    expect(announcement?.classList.contains("warning")).toBe(true);
    expect(announcement?.querySelector(".heading")?.textContent).toBe(
      "Warning",
    );
    expect(announcement?.querySelector(".content")?.textContent).toBe(
      "Mind the gap.",
    );
    expect(container.querySelector("blockquote")).toBeNull();
  });

  it.each([
    ["note", "information", "Note"],
    ["tip", "success", "Tip"],
    ["important", "information", "Important"],
    ["caution", "error", "Caution"],
  ])("presents %s as %s with the heading %s", (kind, criticality, label) => {
    const { container } = render(
      <MarkdownBlockquote data-admonition={kind}>Body.</MarkdownBlockquote>,
    );

    const announcement = container.querySelector(".ds.announcement");
    expect(announcement?.classList.contains(criticality)).toBe(true);
    expect(announcement?.querySelector(".heading")?.textContent).toBe(label);
  });

  it("renders any other quote as a blockquote with its own attributes", () => {
    const { container } = render(
      <MarkdownBlockquote
        data-admonition="evil"
        cite="https://example.com"
        className="custom"
        node={{}}
      >
        Quoted.
      </MarkdownBlockquote>,
    );

    const quote = container.querySelector("blockquote");
    expect(quote?.textContent).toBe("Quoted.");
    expect(quote?.getAttribute("cite")).toBe("https://example.com");
    expect(quote?.className).toBe("custom");
    expect(quote?.hasAttribute("node")).toBe(false);
    expect(quote?.hasAttribute("data-admonition")).toBe(false);
  });
});
