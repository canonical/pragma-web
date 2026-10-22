import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createReferencesPage from "../../../../testing/createReferencesPage.js";
import {
  ONTOLOGY_CLASS_HREF,
  ONTOLOGY_CLASS_NODE,
  UNREFERENCED_HREF,
} from "../../../../testing/fixtures.js";
import { markdownComponents } from "../constants.js";

/** The prose link, reached as a Markdown renderer reaches it. */
const ProseLink = markdownComponents.a;

/** The syntax-tree element a Markdown renderer passes beside the props. */
const HAST_ELEMENT = { type: "element", tagName: "a" };

describe("ProseLink", () => {
  it("renders a reference as its chip, with the author's text and its home", () => {
    const { container } = render(
      createReferencesPage(
        <ProseLink href={ONTOLOGY_CLASS_NODE.uri} node={HAST_ELEMENT}>
          the block
        </ProseLink>,
      ),
    );
    const link = screen.getByRole("link", { name: "the block" });
    expect(link.getAttribute("href")).toBe(ONTOLOGY_CLASS_HREF);
    expect(link.closest(".ds.node-chip")).not.toBeNull();
    expect(container.innerHTML).not.toContain("UI Block");
  });

  it("renders any other link as the plain anchor its author wrote", () => {
    render(
      createReferencesPage(
        <ProseLink href={UNREFERENCED_HREF} node={HAST_ELEMENT} title="Away">
          elsewhere
        </ProseLink>,
      ),
    );
    const link = screen.getByRole("link", { name: "elsewhere" });
    expect(link.getAttribute("href")).toBe(UNREFERENCED_HREF);
    expect(link.getAttribute("title")).toBe("Away");
    expect(link.closest(".ds.node-chip")).toBeNull();
  });

  it("renders a link without an href as a bare anchor", () => {
    const { container } = render(
      createReferencesPage(<ProseLink>nowhere</ProseLink>),
    );
    const anchor = container.querySelector("a");
    expect(anchor?.textContent).toBe("nowhere");
    expect(anchor?.hasAttribute("href")).toBe(false);
  });

  it("never writes the syntax-tree element into the markup", () => {
    const { container } = render(
      createReferencesPage(
        <p>
          <ProseLink href={ONTOLOGY_CLASS_NODE.uri} node={HAST_ELEMENT}>
            the block
          </ProseLink>{" "}
          <ProseLink href={UNREFERENCED_HREF} node={HAST_ELEMENT}>
            elsewhere
          </ProseLink>
        </p>,
      ),
    );
    expect(container.querySelector("[node]")).toBeNull();
    expect(container.innerHTML).not.toContain("[object Object]");
  });
});
