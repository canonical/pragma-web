import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import drawTableTerm from "./drawTableTerm.js";

describe("drawTableTerm", () => {
  it("allows a break right after the prefix's colon only", () => {
    expect(
      renderToStaticMarkup(
        drawTableTerm({
          prefix: "metro",
          local: "Station",
          term: "metro:Station",
        }),
      ),
    ).toBe("metro:<wbr/>Station");
  });

  it("draws a term with no prefix as it is named", () => {
    const iri = "https://example.org/thing";
    expect(
      renderToStaticMarkup(
        drawTableTerm({
          prefix: "https://example.org/",
          local: "thing",
          term: iri,
        }),
      ),
    ).toBe(iri);
  });
});
