/**
 * The class graph's pure geometry: text widths from the shipped font's
 * advance table, path data from commands, a path's samples and bounds, and
 * the rectangle tests the layout keeps its rules with. They share one unit,
 * px of the graph's world space, and one input form, absolute commands
 * with integer coordinates, so the layout, the label placer and the tests
 * measure the same drawing the same way.
 */

import { FONT_METRICS, HEAD_SIZE } from "./constants.js";
import { requireAt } from "./require.js";
import type { FontFace, PathCommand, Point, Rect } from "./types.js";

/**
 * Measure a line of text with the advance table: the sum of its
 * characters' advances at the given size, kerning ignored, a character
 * outside the table measuring 0.6em; tabular figures when asked.
 */
export function measureTextWidth(
  text: string,
  face: FontFace,
  size: number,
  tabular = false,
): number {
  const metrics = FONT_METRICS.faces[face];
  let units = 0;
  for (const character of text) {
    const advance =
      (tabular ? metrics.tabular[character] : undefined) ??
      metrics.advances[character] ??
      FONT_METRICS.fallbackEm * FONT_METRICS.unitsPerEm;
    units += advance;
  }
  return (units * size) / FONT_METRICS.unitsPerEm;
}

/** Measure the em box of a line of text set at `baseline`. */
export function measureTextBox(
  x: number,
  baseline: number,
  width: number,
  size: number,
): Rect {
  const { ascender, descender, unitsPerEm } = FONT_METRICS;
  return {
    x,
    y: baseline - (ascender / unitsPerEm) * size,
    w: width,
    h: ((ascender - descender) / unitsPerEm) * size,
  };
}

/** Find the baseline that centres a line of `size` text in a row `height` tall. */
export function findCentredBaseline(height: number, size: number): number {
  const { ascender, descender, unitsPerEm } = FONT_METRICS;
  const ascent = (ascender / unitsPerEm) * size;
  const descent = (-descender / unitsPerEm) * size;
  return Math.round((height - ascent - descent) / 2 + ascent);
}

/** Round a length up to a multiple of `step`. */
export function ceilTo(value: number, step: number): number {
  return Math.ceil(value / step - 1e-9) * step;
}

/** Round a length to the nearest multiple of `step`. */
export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Write path commands as path data, translated by (`dx`, `dy`).
 *
 * @throws When a coordinate is not an integer: every path is on the grid.
 */
export function formatPathData(
  commands: readonly PathCommand[],
  dx = 0,
  dy = 0,
): string {
  return commands
    .map((command) => {
      const [name, ...values] = command;
      if (name === "H") return `H${requireAt(values, 0) + dx}`;
      if (name === "V") return `V${requireAt(values, 0) + dy}`;
      const shifted = values.map((value, index) =>
        index % 2 === 0 ? value + dx : value + dy,
      );
      const fraction = shifted.find((value) => !Number.isInteger(value));
      if (fraction !== undefined) {
        throw new Error(`a class graph path holds ${fraction}, not an integer`);
      }
      return `${name}${shifted.join(" ")}`;
    })
    .join("");
}

/**
 * Build an arrowhead whose tip touches a box's side at (`x`, `y`): a
 * triangle 8px long and 8px wide, pointing right or left.
 */
export function buildArrowhead(
  x: number,
  y: number,
  pointsRight: boolean,
): PathCommand[] {
  const base = pointsRight ? x - HEAD_SIZE : x + HEAD_SIZE;
  return [
    ["M", x, y],
    ["L", base, y - HEAD_SIZE / 2],
    ["V", y + HEAD_SIZE / 2],
    ["L", x, y],
  ];
}

/** One segment of a parsed path: a line or a cubic, by its points. */
interface Segment {
  readonly kind: "line" | "cubic";
  readonly points: readonly Point[];
}

/** Parse path data of `M`, `L`, `H`, `V` and `C` into subpaths of segments. */
export function parsePathData(d: string): {
  readonly start: Point;
  readonly segments: readonly Segment[];
}[] {
  const tokens = d.match(/[MLHVC]|-?\d+(?:\.\d+)?/g) ?? [];
  const subpaths: { start: Point; segments: Segment[] }[] = [];
  let x = 0;
  let y = 0;
  let index = 0;
  let command = "M";
  const read = (): number => Number(requireAt(tokens, index++));
  while (index < tokens.length) {
    const token = requireAt(tokens, index);
    if (/[MLHVC]/.test(token)) {
      command = token;
      index += 1;
    }
    const segments = subpaths.at(-1)?.segments ?? [];
    if (command === "M") {
      x = read();
      y = read();
      subpaths.push({ start: [x, y], segments: [] });
      command = "L";
    } else if (command === "C") {
      const points: Point[] = [
        [x, y],
        [read(), read()],
        [read(), read()],
        [read(), read()],
      ];
      segments.push({ kind: "cubic", points });
      [x, y] = requireAt(points, 3);
    } else {
      const from: Point = [x, y];
      if (command === "H") x = read();
      else if (command === "V") y = read();
      else {
        x = read();
        y = read();
      }
      segments.push({ kind: "line", points: [from, [x, y]] });
    }
  }
  return subpaths;
}

/** Evaluate a cubic at `t`. */
function evaluateCubic(points: readonly Point[], t: number): Point {
  const p0 = requireAt(points, 0);
  const p1 = requireAt(points, 1);
  const p2 = requireAt(points, 2);
  const p3 = requireAt(points, 3);
  const u = 1 - t;
  const weigh = (axis: 0 | 1): number =>
    u * u * u * p0[axis] +
    3 * u * u * t * p1[axis] +
    3 * u * t * t * p2[axis] +
    t * t * t * p3[axis];
  return [weigh(0), weigh(1)];
}

/** Flatten each subpath of a path into a polyline, each cubic into `steps` segments. */
export function flattenPath(d: string, steps = 16): Point[][] {
  return parsePathData(d).map(({ start, segments }) => {
    const points: Point[] = [start];
    for (const segment of segments) {
      if (segment.kind === "line") {
        points.push(requireAt(segment.points, 1));
      } else {
        for (let step = 1; step <= steps; step += 1) {
          points.push(evaluateCubic(segment.points, step / steps));
        }
      }
    }
    return points;
  });
}

/** Sample a path every `step` px of its length, its ends included. */
export function samplePath(d: string, step: number): Point[] {
  const samples: Point[] = [];
  for (const points of flattenPath(d, 64)) {
    samples.push(requireAt(points, 0));
    let carried = 0;
    for (let index = 1; index < points.length; index += 1) {
      const [x0, y0] = requireAt(points, index - 1);
      const [x1, y1] = requireAt(points, index);
      const length = Math.hypot(x1 - x0, y1 - y0);
      let at = step - carried;
      while (at <= length) {
        samples.push([
          x0 + ((x1 - x0) * at) / length,
          y0 + ((y1 - y0) * at) / length,
        ]);
        at += step;
      }
      carried = length - (at - step);
    }
    samples.push(requireAt(points, -1));
  }
  return samples;
}

/** Find the point at fraction `t` of a path's whole length. */
export function findPointOnPath(d: string, t: number): Point {
  const pieces: { from: Point; to: Point; length: number }[] = [];
  let total = 0;
  for (const points of flattenPath(d, 64)) {
    for (let index = 1; index < points.length; index += 1) {
      const from = requireAt(points, index - 1);
      const to = requireAt(points, index);
      const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
      pieces.push({ from, to, length });
      total += length;
    }
  }
  let remaining = total * t;
  for (const { from, to, length } of pieces) {
    if (remaining <= length) {
      const share = length === 0 ? 0 : remaining / length;
      return [
        from[0] + (to[0] - from[0]) * share,
        from[1] + (to[1] - from[1]) * share,
      ];
    }
    remaining -= length;
  }
  return pieces.at(-1)?.to ?? [0, 0];
}

/** Measure a path's bounding box. */
export function measurePathBounds(d: string): Rect {
  const points = flattenPath(d, 64).flat();
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Shrink a rectangle by `margin` on every side. */
export function insetRect(rect: Rect, margin: number): Rect {
  return {
    x: rect.x + margin,
    y: rect.y + margin,
    w: rect.w - 2 * margin,
    h: rect.h - 2 * margin,
  };
}

/** Whether a point lies strictly inside a rectangle. */
export function containsPoint([x, y]: Point, rect: Rect): boolean {
  return x > rect.x && x < rect.x + rect.w && y > rect.y && y < rect.y + rect.h;
}

/** Whether two rectangles overlap; touching edges do not. */
export function intersectsRect(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

/** Unite rectangles into the box that holds them all. */
export function uniteRects(rects: readonly Rect[]): Rect {
  const x = Math.min(...rects.map((rect) => rect.x));
  const y = Math.min(...rects.map((rect) => rect.y));
  return {
    x,
    y,
    w: Math.max(...rects.map((rect) => rect.x + rect.w)) - x,
    h: Math.max(...rects.map((rect) => rect.y + rect.h)) - y,
  };
}

/** Compare two strings by code unit, as the layout orders IRIs and labels. */
export function compareText(a: string, b: string): number {
  if (a < b) return -1;
  return a > b ? 1 : 0;
}

/**
 * Compare by several keys in order: the first comparison that is not zero
 * decides, so a sort reads its tie-breakers as one list.
 */
export function orderBy(...comparisons: readonly number[]): number {
  return comparisons.find((comparison) => comparison !== 0) ?? 0;
}

/** Average a list of numbers. */
export function averageOf(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
