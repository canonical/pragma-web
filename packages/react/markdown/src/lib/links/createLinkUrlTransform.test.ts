import type { Element } from "hast";
import { describe, expect, it } from "vitest";
import createLinkUrlTransform from "./createLinkUrlTransform.js";

/** The element a URL transform is handed; these transforms never read it. */
const ELEMENT: Element = {
  type: "element",
  tagName: "a",
  properties: {},
  children: [],
};

describe("createLinkUrlTransform", () => {
  const transform = createLinkUrlTransform(["ds", "cs"]);

  it("keeps an href in a named scheme", () => {
    expect(transform("ds:global.component.button", "href", ELEMENT)).toBe(
      "ds:global.component.button",
    );
    expect(transform("cs:code.array.safe_access", "href", ELEMENT)).toBe(
      "cs:code.array.safe_access",
    );
  });

  it("empties an href in a scheme it was not given", () => {
    expect(transform("anatomy:slot", "href", ELEMENT)).toBe("");
    expect(transform("javascript:alert(1)", "href", ELEMENT)).toBe("");
  });

  it("compares schemes in lower case only, as the sanitiser does", () => {
    expect(transform("DS:global.component.button", "href", ELEMENT)).toBe("");
  });

  it("passes the default schemes and relative URLs through", () => {
    expect(transform("https://example.com", "href", ELEMENT)).toBe(
      "https://example.com",
    );
    expect(transform("#section", "href", ELEMENT)).toBe("#section");
    expect(transform("docs/ds:page", "href", ELEMENT)).toBe("docs/ds:page");
  });

  it("leaves an image's src to the default schemes", () => {
    expect(transform("ds:logo.png", "src", ELEMENT)).toBe("");
    expect(transform("https://example.com/logo.png", "src", ELEMENT)).toBe(
      "https://example.com/logo.png",
    );
  });

  it("keeps nothing new with no scheme named", () => {
    expect(
      createLinkUrlTransform([])("ds:global.component.button", "href", ELEMENT),
    ).toBe("");
  });
});
