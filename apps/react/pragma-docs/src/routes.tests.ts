// @vitest-environment node

/**
 * The app route table's address space: a chip and the route it lands on
 * must speak the SAME address for the same noun — byte-identical, encoding
 * included. If either side changes its encoding, these pins snap.
 */

import { describe, expect, it } from "vitest";
import { resolveChipHref } from "#lib/Chip";
import {
  COMPONENT_URI,
  STANDARD_URI,
  UIBLOCK_TERM,
} from "../testing/fixtures.js";
import { appRoutes } from "./routes.js";

describe("appRoutes", () => {
  it("round-trips componentEntity render() against resolveChipHref (the D31 landing pin)", () => {
    expect(appRoutes.componentEntity.render({ uri: COMPONENT_URI })).toBe(
      resolveChipHref(COMPONENT_URI, "component"),
    );
  });

  it("round-trips definitionsTerm render() against the term chip href", () => {
    expect(appRoutes.definitionsTerm.render({ term: UIBLOCK_TERM })).toBe(
      resolveChipHref(UIBLOCK_TERM, "term"),
    );
  });

  // `resolveChipHref` is form-agnostic and would pass with a compact IRI
  // too; the absolute form is pinned because a pin that tests a shape the
  // app no longer emits tests nothing.
  it("round-trips standardEntity render() against the standard chip href", () => {
    expect(appRoutes.standardEntity.render({ uri: STANDARD_URI })).toBe(
      resolveChipHref(STANDARD_URI, "standard"),
    );
  });
});
