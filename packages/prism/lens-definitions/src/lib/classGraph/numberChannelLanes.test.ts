import { describe, expect, it } from "vitest";
import { BRIDGE_CHANNEL_ROOM, BRIDGE_GAP_ROOM } from "./constants.js";
import numberChannelLanes from "./numberChannelLanes.js";
import type { LaneChannel, LaneRoute } from "./types.js";

/** A channel beside a column, by its middle. */
const beside = (base: number): LaneChannel => ({
  base,
  room: BRIDGE_CHANNEL_ROOM,
});

/** A gap between regions or shelves, or a margin, by its middle. */
const gap = (base: number): LaneChannel => ({ base, room: BRIDGE_GAP_ROOM });

/** A route from `start` to `end` along `channels`. */
const route = (
  start: readonly [number, number],
  channels: readonly LaneChannel[],
  end: readonly [number, number],
): LaneRoute => ({ start, channels, end });

describe("numberChannelLanes", () => {
  it("keeps a lone route on every channel's middle", () => {
    expect(
      numberChannelLanes([
        route([100, 50], [beside(120), gap(-24), beside(220)], [240, 60]),
      ]),
    ).toEqual([[120, -24, 220]]);
  });

  it("gives two bridges of different pairs a lane each in the gap they share", () => {
    expect(
      numberChannelLanes([
        route([100, 50], [beside(120), gap(-24), beside(300)], [320, 40]),
        route([200, 60], [beside(220), gap(-24), beside(400)], [420, 30]),
      ]),
    ).toEqual([
      [120, -28, 300],
      [220, -20, 400],
    ]);
  });

  it("nests two arches by span, the wider outermost, above a shelf and below one", () => {
    const over = numberChannelLanes([
      route([100, 50], [beside(120), gap(-24), beside(400)], [420, 40]),
      route([200, 60], [beside(220), gap(-24), beside(300)], [320, 30]),
    ]);
    expect(over.map((lanes) => lanes[1])).toEqual([-28, -20]);
    const under = numberChannelLanes([
      route([100, -50], [beside(120), gap(24), beside(400)], [420, -40]),
      route([200, -60], [beside(220), gap(24), beside(300)], [320, -30]),
    ]);
    expect(under.map((lanes) => lanes[1])).toEqual([28, 20]);
  });

  it("keeps two ports at one height, either side of a gap, each on the lane nearer its own box", () => {
    // P leaves the box right of the gap; Q enters the box left of it.
    const [p, q] = numberChannelLanes([
      route([576, 600], [gap(552), gap(400), beside(300)], [280, 380]),
      route([700, 300], [beside(680), gap(450), gap(552)], [528, 600]),
    ]);
    expect(p?.[0]).toBe(556);
    expect(q?.[2]).toBe(548);
  });

  it("nests routes that leave one channel for one gap and turn the same way: the lowest port farthest from its box and lowest in the gap", () => {
    // The metro's three bridges from geo into metro.
    expect(
      numberChannelLanes([
        route([400, 376], [gap(376), gap(264), beside(296)], [240, 136]),
        route([400, 328], [gap(376), gap(264), beside(296)], [240, 132]),
        route([400, 332], [gap(376), gap(264), beside(136)], [96, 136]),
      ]),
    ).toEqual([
      [368, 272, 292],
      [384, 256, 300],
      [376, 264, 136],
    ]);
  });

  it("keeps a route's runs along one channel on one lane", () => {
    const [straight] = numberChannelLanes([
      route([192, 280], [gap(216), gap(216), gap(216)], [192, 184]),
      route([240, 250], [gap(216), gap(100), beside(50)], [30, 80]),
    ]);
    expect(straight?.[0]).toBe(straight?.[2]);
  });

  it("narrows the lanes of a full channel beside a column, and from six lays them on one line: a limit of this layout", () => {
    const routes = (count: number) =>
      Array.from({ length: count }, (_, index) =>
        route([80, 10 * index], [beside(100)], [120, 200 + index]),
      );
    expect(
      numberChannelLanes(routes(4))
        .flat()
        .sort((a, b) => a - b),
    ).toEqual([97, 99, 101, 103]);
    expect(new Set(numberChannelLanes(routes(7)).flat())).toEqual(
      new Set([100]),
    );
  });
});
