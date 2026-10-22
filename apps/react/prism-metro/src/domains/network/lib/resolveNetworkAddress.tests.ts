// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildNetworkLines from "../../../../testing/buildNetworkLines.js";
import { METRO_NAMESPACE } from "../../../../testing/fixtures.js";
import resolveNetworkAddress from "./resolveNetworkAddress.js";

const lines = buildNetworkLines();

describe("resolveNetworkAddress", () => {
  it("resolves a line's compact address and its IRI to the IRI", () => {
    const iri = `${METRO_NAMESPACE}circle-line`;
    expect(resolveNetworkAddress("metro:circle-line", lines, "line")).toBe(iri);
    expect(resolveNetworkAddress(iri, lines, "line")).toBe(iri);
  });

  it("resolves a stop any route calls at", () => {
    expect(resolveNetworkAddress("metro:tannery-lane", lines, "stop")).toBe(
      `${METRO_NAMESPACE}tannery-lane`,
    );
  });

  it("finds a line only as a line and a stop only as a stop", () => {
    expect(
      resolveNetworkAddress("metro:circle-line", lines, "stop"),
    ).toBeUndefined();
    expect(
      resolveNetworkAddress("metro:tannery-lane", lines, "line"),
    ).toBeUndefined();
  });

  it("finds nothing the network does not route", () => {
    expect(resolveNetworkAddress("metro:ghost", lines, "stop")).toBeUndefined();
  });
});
