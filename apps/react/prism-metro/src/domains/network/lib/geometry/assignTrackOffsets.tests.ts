// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildNetworkLines from "../../../../../testing/buildNetworkLines.js";
import { METRO_NAMESPACE } from "../../../../../testing/fixtures.js";
import assignTrackOffsets from "./assignTrackOffsets.js";
import { TRACK_SPACING } from "./constants.js";
import selectDrawnRoutes from "./selectDrawnRoutes.js";
import type { DiagramLine } from "./types.js";

const lines = buildNetworkLines();
const drawn = lines.map((line) => ({
  ...line,
  routes: selectDrawnRoutes(line.routes),
}));

/** The key of the segment between two stops, by local name. */
const keySegment = (a: string, b: string): string =>
  [`${METRO_NAMESPACE}${a}`, `${METRO_NAMESPACE}${b}`].sort().join(" ");

/** The IRI of the line with local name `local`. */
const lineUri = (local: string): string => `${METRO_NAMESPACE}${local}`;

describe("assignTrackOffsets", () => {
  const offsets = assignTrackOffsets(drawn);

  it("centres a stretch one line runs over", () => {
    expect(
      offsets
        .get(keySegment("northgate", "verge-park"))
        ?.get(lineUri("north-line")),
    ).toBe(0);
  });

  it("puts two lines sharing a stretch side by side, in code order", () => {
    const shared = offsets.get(
      keySegment("central-exchange", "riverside-junction"),
    );
    expect(shared?.get(lineUri("circle-line"))).toBe(-TRACK_SPACING / 2);
    expect(shared?.get(lineUri("coastal-line"))).toBe(TRACK_SPACING / 2);
  });

  it("draws a ring run by two lines as two parallel tracks", () => {
    const ring = offsets.get(keySegment("dyers-green", "fernside"));
    expect(ring?.get(lineUri("ringway-clockwise"))).toBe(-TRACK_SPACING / 2);
    expect(ring?.get(lineUri("ringway-anticlockwise"))).toBe(TRACK_SPACING / 2);
  });

  it("orders codes as numbers, so 2 comes before 10", () => {
    const north = lines.at(0) as DiagramLine;
    const tenth = { ...north, uri: lineUri("tenth"), code: "10" };
    const second = { ...north, uri: lineUri("second"), code: "2" };
    const ordered = assignTrackOffsets([tenth, second]).get(
      keySegment("northgate", "verge-park"),
    );
    expect(ordered?.get(lineUri("second"))).toBe(-TRACK_SPACING / 2);
    expect(ordered?.get(lineUri("tenth"))).toBe(TRACK_SPACING / 2);
  });

  it("counts a line once on a stretch both its routes run over", () => {
    const north = lines.at(0) as DiagramLine;
    expect(north.routes).toHaveLength(2);
    expect(
      assignTrackOffsets([north])
        .get(keySegment("northgate", "verge-park"))
        ?.get(north.uri),
    ).toBe(0);
  });
});
