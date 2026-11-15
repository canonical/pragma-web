import {
  PEEK_EDGE_INSET_PX,
  PEEK_OFFSET_PX,
  PEEK_TOLERANCE_PX,
} from "./constants.js";
import type { PeekMeasure, PeekPlace } from "./types.js";

/**
 * The places a peek tries, in the order its stylesheet lists them: below
 * the chip from its start, from its end, above it from its start, from its
 * end, then spanning the viewport below the chip and above it.
 */
const PEEK_PLACES: readonly PeekPlace[] = [
  { block: "below", inline: "start" },
  { block: "below", inline: "end" },
  { block: "above", inline: "start" },
  { block: "above", inline: "end" },
  { block: "below", inline: "viewport" },
  { block: "above", inline: "viewport" },
];

/** Whether two edges meet, within the tolerance. */
const meets = (a: number, b: number): boolean =>
  Math.abs(a - b) <= PEEK_TOLERANCE_PX;

/**
 * Read where an open peek lies against its chip, and where its
 * stylesheet's order puts it: the first of its places where the peek, at
 * its measured size, fits the viewport, or its first place when none
 * does. A peek that follows its rule lies where the order puts it, on any
 * viewport.
 *
 * @param measure - What `measurePeek` read, with a peek open.
 * @returns The place the peek lies in and the place its order chooses.
 */
export default function placePeek(measure: PeekMeasure): {
  readonly actual: PeekPlace;
  readonly chosen: PeekPlace;
} {
  const { chip, peek, viewport } = measure;
  if (peek === null) throw new Error("no peek is open");
  const actual: PeekPlace = {
    block: meets(peek.top, chip.bottom + PEEK_OFFSET_PX)
      ? "below"
      : meets(peek.bottom, chip.top - PEEK_OFFSET_PX)
        ? "above"
        : "elsewhere",
    inline: meets(peek.left, chip.left)
      ? "start"
      : meets(peek.right, chip.right)
        ? "end"
        : meets(peek.left, PEEK_EDGE_INSET_PX)
          ? "viewport"
          : "elsewhere",
  };
  const fits = ({ block, inline }: PeekPlace): boolean =>
    (block === "below"
      ? chip.bottom + PEEK_OFFSET_PX + peek.height <=
        viewport.height + PEEK_TOLERANCE_PX
      : chip.top - PEEK_OFFSET_PX - peek.height >= -PEEK_TOLERANCE_PX) &&
    (inline === "start"
      ? chip.left + peek.width <= viewport.width + PEEK_TOLERANCE_PX
      : inline === "end"
        ? chip.right - peek.width >= -PEEK_TOLERANCE_PX
        : true);
  const [first] = PEEK_PLACES;
  return {
    actual,
    chosen: PEEK_PLACES.find(fits) ?? (first as PeekPlace),
  };
}
