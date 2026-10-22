import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { duplicateHeadingsDocument } from "../../../testing/fixtures.js";
import { extractHeadings, Markdown } from "../../index.js";

/**
 * The ids of the headings a document renders, in document order, leaving out
 * the label of the generated footnotes section.
 */
function renderHeadingIds(sanitize: boolean): string[] {
  const { container } = render(
    <Markdown source={duplicateHeadingsDocument} sanitize={sanitize} />,
  );
  return Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6"))
    .filter((heading) => heading.closest("[data-footnotes]") === null)
    .map((heading) => heading.id);
}

describe("heading anchors", () => {
  it.each([true, false])(
    "links a table of contents to the rendered headings (sanitize: %s)",
    (sanitize) => {
      const listed = extractHeadings(duplicateHeadingsDocument).map(
        (heading) => heading.id,
      );

      expect(renderHeadingIds(sanitize)).toEqual(listed);
    },
  );
});
