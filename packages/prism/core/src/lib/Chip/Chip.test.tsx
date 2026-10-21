import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PREFIXES } from "../../../testing/fixtures.js";
import Chip from "./Chip.js";

describe("Chip", () => {
  it("renders as a non-interactive span without an href", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        kind="component"
        label="Button"
        uri="ds:global.component.button"
      />,
    );
    const chip = screen.getByText("Button");
    expect(chip.tagName).toBe("SPAN");
    expect(chip).not.toHaveAttribute("role");
    expect(chip).not.toHaveAttribute("tabindex");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders as a link with an href", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        href="/components/button"
        kind="component"
        label="Button"
        uri="ds:global.component.button"
      />,
    );
    const chip = screen.getByRole("link", { name: "Button" });
    expect(chip).toHaveAttribute("href", "/components/button");
  });

  it("keeps a paragraph's textContent intact — chips read as plain text", () => {
    // Ignored, a chip never blocks the reading path. The summary
    // must not leak into the text either — it travels as attributes
    // (aria-description, title), never as a text node.
    render(
      <p data-testid="prose">
        Use the{" "}
        <Chip
          prefixes={PREFIXES}
          href="/components/button"
          kind="component"
          label="Button"
          lifecycle="canonical"
          summary="The primary action component."
          uri="ds:global.component.button"
        />{" "}
        component with the{" "}
        <Chip
          prefixes={PREFIXES}
          box="class"
          kind="standard"
          label="imports"
          uri="cs:typescript.imports"
        />{" "}
        standard.
      </p>,
    );
    expect(screen.getByTestId("prose").textContent).toBe(
      "Use the Button component with the imports standard.",
    );
  });

  it("derives the namespace from the uri prefix by default", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        kind="standard"
        label="imports"
        uri="cs:typescript.imports"
      />,
    );
    expect(screen.getByText("imports")).toHaveAttribute("data-namespace", "cs");
  });

  it("lets an explicit namespace override the uri prefix", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        kind="standard"
        label="imports"
        namespace="docs"
        uri="cs:typescript.imports"
      />,
    );
    expect(screen.getByText("imports")).toHaveAttribute(
      "data-namespace",
      "docs",
    );
  });

  it("exposes its identity and channel values as data attributes", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        kind="component"
        label="Button"
        uri="ds:global.component.button"
      />,
    );
    const chip = screen.getByText("Button");
    expect(chip).toHaveAttribute("data-uri", "ds:global.component.button");
    expect(chip).toHaveAttribute("data-kind", "component");
    // The defaults: a mention names an instance and asserts no lifecycle.
    expect(chip).toHaveAttribute("data-box", "instance");
    expect(chip).toHaveAttribute("data-lifecycle", "none");
  });

  it("sets one custom property per encoding channel", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        box="class"
        kind="pattern"
        label="Modal form"
        lifecycle="beta"
        uri="ds:global.pattern.modal-form"
      />,
    );
    const style = screen.getByText("Modal form").style;
    expect(style.getPropertyValue("--chip-tint")).toContain("--chip-tint-l");
    expect(style.getPropertyValue("--chip-radius")).toBe(
      "var(--chip-radius-pattern, 1.25em)",
    );
    expect(style.getPropertyValue("--chip-fill-weight")).toBe("0%");
    expect(style.getPropertyValue("--chip-stroke-weight")).toBe("80%");
    expect(style.getPropertyValue("--chip-dot")).toContain("--chip-dot-beta");
  });

  it("shows the summary as a hover peek via title", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        kind="term"
        label="density"
        summary="How tightly a layout packs its controls."
        uri="docs:glossary.density"
      />,
    );
    expect(screen.getByText("density")).toHaveAttribute(
      "title",
      "How tightly a layout packs its controls.",
    );
  });

  it("omits the title when no summary is given", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        kind="term"
        label="density"
        uri="docs:glossary.density"
      />,
    );
    expect(screen.getByText("density")).not.toHaveAttribute("title");
  });

  it("exposes the summary to assistive tech via aria-description", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        kind="term"
        label="density"
        summary="How tightly a layout packs its controls."
        uri="docs:glossary.density"
      />,
    );
    expect(screen.getByText("density")).toHaveAttribute(
      "aria-description",
      "How tightly a layout packs its controls.",
    );
  });

  it("folds an asserted lifecycle's catalog label into the aria-description", () => {
    // The dot's meaning must reach assistive tech, not just sighted readers.
    render(
      <Chip
        prefixes={PREFIXES}
        kind="component"
        label="Button"
        lifecycle="deprecated"
        summary="The primary action component."
        uri="ds:global.component.button"
      />,
    );
    expect(screen.getByText("Button")).toHaveAttribute(
      "aria-description",
      "The primary action component. (Deprecated)",
    );
  });

  it("omits aria-description without a summary, even with a lifecycle", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        kind="component"
        label="Button"
        lifecycle="beta"
        uri="ds:global.component.button"
      />,
    );
    expect(screen.getByText("Button")).not.toHaveAttribute("aria-description");
  });

  it("calls onNavigate with the uri when the link is clicked", () => {
    const handleNavigate = vi.fn(
      (_uri: string, event: { preventDefault: () => void }) => {
        // Prevent jsdom from attempting real navigation.
        event.preventDefault();
      },
    );
    render(
      <Chip
        prefixes={PREFIXES}
        href="/components/button"
        kind="component"
        label="Button"
        onNavigate={handleNavigate}
        uri="ds:global.component.button"
      />,
    );
    screen.getByRole("link", { name: "Button" }).click();
    expect(handleNavigate).toHaveBeenCalledTimes(1);
    expect(handleNavigate.mock.calls.at(0)?.at(0)).toBe(
      "ds:global.component.button",
    );
  });

  it("applies additional class names alongside the component classes", () => {
    render(
      <Chip
        prefixes={PREFIXES}
        className="extra"
        kind="component"
        label="Button"
        uri="ds:global.component.button"
      />,
    );
    const chip = screen.getByText("Button");
    expect(chip.className).toContain("ds chip");
    expect(chip.className).toContain("extra");
  });

  it("rejects an empty uri or label at the content boundary", () => {
    // React reports the render error before rethrowing; keep the output clean.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      expect(() =>
        render(
          <Chip uri="" label="Button" kind="component" prefixes={PREFIXES} />,
        ),
      ).toThrow(/"uri" must be a non-empty string/);
      expect(() =>
        render(
          <Chip
            uri="ds:global.component.button"
            label=""
            kind="component"
            prefixes={PREFIXES}
          />,
        ),
      ).toThrow(/"label" must be a non-empty string/);
    } finally {
      consoleError.mockRestore();
    }
  });

  it("tints a namespace outside the prefixes with the unknown tint", () => {
    render(
      <Chip
        kind="term"
        label="Mystery"
        prefixes={PREFIXES}
        uri="mystery:thing"
      />,
    );
    const chip = screen.getByText("Mystery");
    expect(chip).toHaveAttribute("data-namespace", "mystery");
    expect(chip.style.getPropertyValue("--chip-tint")).toContain(
      "--chip-tint-unknown",
    );
  });

  it("marks a URI with no prefix with an empty namespace", () => {
    render(
      <Chip kind="term" label="Bare" prefixes={PREFIXES} uri="bare-name" />,
    );
    expect(screen.getByText("Bare")).toHaveAttribute("data-namespace", "");
  });

  it("passes native props through to the root, under its own attributes", () => {
    render(
      <Chip
        data-kind="overridden"
        data-testid="chip"
        id="button-mention"
        kind="component"
        label="Button"
        prefixes={PREFIXES}
        style={{ fontWeight: 700 }}
        uri="ds:global.component.button"
      />,
    );
    const chip = screen.getByTestId("chip");
    expect(chip.id).toBe("button-mention");
    expect(chip.style.fontWeight).toBe("700");
    // The chip's own channel style and data attributes win.
    expect(chip.style.getPropertyValue("--chip-radius")).toBe(
      "var(--chip-radius-component, 0.375em)",
    );
    expect(chip).toHaveAttribute("data-kind", "component");
  });

  it("passes the anchor's native props through on the linked form", () => {
    render(
      <Chip
        href="/components/button"
        kind="component"
        label="Button"
        prefixes={PREFIXES}
        rel="noopener"
        uri="ds:global.component.button"
      />,
    );
    expect(screen.getByRole("link", { name: "Button" })).toHaveAttribute(
      "rel",
      "noopener",
    );
  });

  it("calls the native onClick before onNavigate", () => {
    const calls: string[] = [];
    render(
      <Chip
        href="/components/button"
        kind="component"
        label="Button"
        onClick={(event) => {
          event.preventDefault();
          calls.push("onClick");
        }}
        onNavigate={(uri) => calls.push(`onNavigate ${uri}`)}
        prefixes={PREFIXES}
        uri="ds:global.component.button"
      />,
    );
    screen.getByRole("link", { name: "Button" }).click();
    expect(calls).toEqual(["onClick", "onNavigate ds:global.component.button"]);
  });

  it("follows a link with neither onClick nor onNavigate", () => {
    render(
      <Chip
        href="#button"
        kind="component"
        label="Button"
        prefixes={PREFIXES}
        uri="ds:global.component.button"
      />,
    );
    expect(() =>
      screen.getByRole("link", { name: "Button" }).click(),
    ).not.toThrow();
  });
});
