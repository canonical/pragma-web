import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectSectionIndex } from "../../../testing/index.js";
import { SectionedView } from "../../lib/ui/SectionedView/index.js";

/** Two sections, in the order a page passes them. */
const SECTIONS = [
  { id: "usage", title: "Usage", content: <p>Use it.</p> },
  { id: "anatomy", title: "Anatomy", content: <p>Its parts.</p> },
] as const;

/** Render a view of the sections given and return its root. */
const renderView = (
  sections: readonly (typeof SECTIONS)[number][] = SECTIONS,
): Element => {
  const { container } = render(
    <SectionedView header={<h1>Button</h1>} sections={sections} />,
  );
  const root = container.firstElementChild;
  if (root === null) throw new Error("the view rendered nothing");
  return root;
};

describe("expectSectionIndex", () => {
  it("passes a view given exactly these sections, in order", () => {
    expect(() => expectSectionIndex(renderView(), SECTIONS)).not.toThrow();
  });

  it("fails when the headings come in another order than the sections", () => {
    const root = renderView();
    const [first, second] = [...root.querySelectorAll(".content > section")];
    if (first === undefined || second === undefined) {
      throw new Error("the view rendered fewer than two sections");
    }
    first.before(second);
    expect(() => expectSectionIndex(root, SECTIONS)).toThrow(
      /section headings, in order/,
    );
  });

  it("fails when a heading's text is not the section's title", () => {
    const root = renderView();
    const heading = root.querySelector("#usage");
    if (heading === null) throw new Error("no heading for usage");
    heading.textContent = "How to use";
    expect(() => expectSectionIndex(root, SECTIONS)).toThrow(
      /section headings, in order/,
    );
  });

  it("fails on a level-2 heading a section's content writes itself", () => {
    const root = renderView();
    const body = root.querySelector("#usage + .section-body");
    if (body === null) throw new Error("no body for usage");
    const stray = document.createElement("h2");
    stray.textContent = "Do";
    body.append(stray);
    expect(() => expectSectionIndex(root, SECTIONS)).toThrow(
      /neither a section's nor the index's label/,
    );
  });

  it("fails on a page that is not a sectioned view, even with no section", () => {
    const { container } = render(<article>Nothing here</article>);
    expect(() => expectSectionIndex(container, [])).toThrow(
      /is a sectioned view/,
    );
  });

  it("fails on a view with no section when sections were expected", () => {
    expect(() => expectSectionIndex(renderView([]), SECTIONS)).toThrow();
  });
});
