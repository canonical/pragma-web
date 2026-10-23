import { describe, expect, it } from "vitest";
import findLocalName from "./findLocalName.js";

describe("findLocalName", () => {
  it("finds the name after an IRI's last slash", () => {
    expect(findLocalName("https://ds.canonical.com/modifier")).toBe("modifier");
  });

  it("finds the name after an IRI's fragment mark", () => {
    expect(findLocalName("http://www.w3.org/2002/07/owl#inverseOf")).toBe(
      "inverseOf",
    );
  });

  it("finds the name after a URN's last colon", () => {
    expect(findLocalName("urn:example:modifier")).toBe("modifier");
  });

  it("answers the whole IRI when it ends in a separator", () => {
    expect(findLocalName("https://ds.canonical.com/")).toBe(
      "https://ds.canonical.com/",
    );
  });
});
