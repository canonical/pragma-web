// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
  listPeekViolations,
  type PeekBox,
  type PeekMeasure,
  type PeekPlace,
  placePeek,
} from "../../../testing/browser/index.js";

/** The peek's size in every case but those that change it. */
const PEEK_SIZE = { width: 248, height: 200 } as const;

/** A desktop viewport, and a viewport narrower than a chip and its peek. */
const WIDE = { width: 1000, height: 800 } as const;
const NARROW = { width: 300, height: 800 } as const;

/**
 * Build a chip's box, 100px wide and 28px high, from its top-left corner.
 */
const buildChip = (left: number, top: number, width = 100): PeekBox => ({
  top,
  right: left + width,
  bottom: top + 28,
  left,
});

/**
 * Build what `measurePeek` reads of a chip whose peek lies at `place`,
 * 4px from the chip: a dialog in no link, holding a live link.
 */
const measureAt = (
  chip: PeekBox,
  place: PeekPlace,
  viewport: PeekMeasure["viewport"] = WIDE,
  size: { readonly width: number; readonly height: number } = PEEK_SIZE,
): PeekMeasure => {
  const top =
    place.block === "below" ? chip.bottom + 4 : chip.top - 4 - size.height;
  const left =
    place.inline === "start"
      ? chip.left
      : place.inline === "end"
        ? chip.right - size.width
        : 4;
  return {
    chip,
    peek: {
      top,
      right: left + size.width,
      bottom: top + size.height,
      left,
      ...size,
    },
    viewport,
    role: "dialog",
    inLink: false,
    liveLinks: ["/a"],
    chipLinkFocused: false,
    times: {},
  };
};

/** Move a measure's peek by `dx` and `dy` pixels. */
const shiftPeek = (
  measure: PeekMeasure,
  dx: number,
  dy: number,
): PeekMeasure => {
  const { peek } = measure;
  if (peek === null) throw new Error("the measure holds no peek");
  return {
    ...measure,
    peek: {
      ...peek,
      top: peek.top + dy,
      bottom: peek.bottom + dy,
      left: peek.left + dx,
      right: peek.right + dx,
    },
  };
};

/**
 * One chip per place, where that place is the first of the order that
 * fits: the chip's corner, the viewport, and the place.
 */
const FIRST_FITS: readonly (readonly [
  string,
  PeekBox,
  PeekMeasure["viewport"],
  PeekPlace,
])[] = [
  [
    "near the top left",
    buildChip(100, 100),
    WIDE,
    { block: "below", inline: "start" },
  ],
  [
    "near the top right",
    buildChip(850, 100),
    WIDE,
    { block: "below", inline: "end" },
  ],
  [
    "near the bottom left",
    buildChip(100, 700),
    WIDE,
    { block: "above", inline: "start" },
  ],
  [
    "near the bottom right",
    buildChip(850, 700),
    WIDE,
    { block: "above", inline: "end" },
  ],
  [
    "mid-line near the top of a narrow viewport",
    buildChip(100, 100, 20),
    NARROW,
    { block: "below", inline: "viewport" },
  ],
  [
    "mid-line near the bottom of a narrow viewport",
    buildChip(100, 700, 20),
    NARROW,
    { block: "above", inline: "viewport" },
  ],
];

describe("placePeek", () => {
  it.each(FIRST_FITS)(
    "chooses the first place that fits for a chip %s, and reads the peek there",
    (_where, chip, viewport, place) => {
      const { actual, chosen } = placePeek(measureAt(chip, place, viewport));
      expect(chosen).toEqual(place);
      expect(actual).toEqual(place);
    },
  );

  it("chooses the first place when none fits", () => {
    const chip = buildChip(100, 130, 20);
    const viewport = { width: 300, height: 300 };
    const measure = measureAt(
      chip,
      { block: "above", inline: "viewport" },
      viewport,
      { width: 248, height: 280 },
    );
    expect(placePeek(measure).chosen).toEqual({
      block: "below",
      inline: "start",
    });
  });

  it("reads a peek half a pixel off as in its place, and 5px off as elsewhere", () => {
    const place: PeekPlace = { block: "below", inline: "start" };
    const measure = measureAt(buildChip(100, 100), place);
    expect(placePeek(shiftPeek(measure, 0.5, 0.5)).actual).toEqual(place);
    expect(placePeek(shiftPeek(measure, 5, 5)).actual).toEqual({
      block: "elsewhere",
      inline: "elsewhere",
    });
  });

  it("throws when no peek is open", () => {
    const measure = measureAt(buildChip(100, 100), {
      block: "below",
      inline: "start",
    });
    expect(() => placePeek({ ...measure, peek: null })).toThrow(
      "no peek is open",
    );
  });
});

describe("listPeekViolations", () => {
  const BELOW_START: PeekPlace = { block: "below", inline: "start" };

  it.each(FIRST_FITS)(
    "lists nothing for a peek in its place, for a chip %s",
    (_where, chip, viewport, place) => {
      expect(listPeekViolations(measureAt(chip, place, viewport))).toEqual([]);
    },
  );

  it("names a peek that is not open", () => {
    const measure = measureAt(buildChip(100, 100), BELOW_START);
    expect(listPeekViolations({ ...measure, peek: null })).toEqual([
      "no peek is open",
    ]);
  });

  it("names a peek that is no dialog, sits in a link and holds no live link", () => {
    const measure = measureAt(buildChip(100, 100), BELOW_START);
    expect(
      listPeekViolations({
        ...measure,
        role: "tooltip",
        inLink: true,
        liveLinks: [],
      }),
    ).toEqual([
      "its role is tooltip",
      "it sits inside a link",
      "it holds no live link",
    ]);
  });

  it("names a peek of the wrong width, and takes the viewport's less its insets where it is narrower", () => {
    const chip = buildChip(100, 100, 20);
    const viewport = { width: 200, height: 800 };
    const place: PeekPlace = { block: "below", inline: "viewport" };
    expect(
      listPeekViolations(
        measureAt(chip, place, viewport, { width: 192, height: 200 }),
      ),
    ).toEqual([]);
    const wide = measureAt(buildChip(100, 100), BELOW_START, WIDE, {
      width: 260,
      height: 200,
    });
    expect(listPeekViolations(wide)).toEqual(["it is 260px wide, not 248px"]);
  });

  it("names a peek taller than the viewport less its insets", () => {
    const measure = measureAt(buildChip(100, 0), BELOW_START, WIDE, {
      width: 248,
      height: 793,
    });
    expect(listPeekViolations(measure)).toContain(
      "it is 793px high in a 800px viewport",
    );
  });

  it("names a peek that reaches past the viewport", () => {
    const measure = measureAt(buildChip(100, 100), BELOW_START);
    const [line] = listPeekViolations(shiftPeek(measure, -101, 0));
    expect(line).toMatch(/^it reaches past the viewport: /);
  });

  it("names a peek that lies in a place other than the one its order chooses", () => {
    const measure = measureAt(buildChip(100, 400), {
      block: "above",
      inline: "start",
    });
    expect(listPeekViolations(measure)).toEqual([
      "it lies above the chip from start, where its order puts it below from start",
    ]);
  });
});
