// @vitest-environment node

/**
 * The app route table's address space: a chip and the route it lands on
 * must speak the SAME address for the same noun — byte-identical, encoding
 * included. If either side changes its encoding, these pins snap.
 */

import { describe, expect, it } from "vitest";
import { resolveChipHref } from "#lib/Chip";
import { appRoutes } from "./routes.js";

/** The definitions exemplar term (percent-encoded in URLs). */
const UIBLOCK_TERM = "ds:UIBlock";

/**
 * The standards exemplar — the ABSOLUTE IRI, percent-encoded in URLs.
 * `node(id:)` accepts nothing else, so the reading route's param is not
 * the compact form. `resolveChipHref` is form-agnostic and would pass with
 * a compact constant too; the absolute form is used because a pin that
 * tests a shape the app no longer emits tests nothing.
 */
const STANDARD_URI =
  "http://pragma.canonical.com/codestandards#code.array.safe_access";

describe("appRoutes", () => {
  it("round-trips componentEntity render() against resolveChipHref (the D31 landing pin)", () => {
    expect(
      appRoutes.componentEntity.render({ uri: "ds:global.component.button" }),
    ).toBe(resolveChipHref("ds:global.component.button", "component"));
  });

  it("round-trips definitionsTerm render() against the term chip href", () => {
    expect(appRoutes.definitionsTerm.render({ term: UIBLOCK_TERM })).toBe(
      resolveChipHref(UIBLOCK_TERM, "term"),
    );
  });

  it("round-trips standardEntity render() against the standard chip href", () => {
    expect(appRoutes.standardEntity.render({ uri: STANDARD_URI })).toBe(
      resolveChipHref(STANDARD_URI, "standard"),
    );
  });
});
