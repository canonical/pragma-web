import type { ExampleMeasures } from "./types.js";

/**
 * The total length and capacity of vehicles coupled end to end. Lengths are
 * measured over couplers, so they add up without gaps. An empty list
 * measures zero.
 */
export const sumMeasures = (
  measures: readonly ExampleMeasures[],
): ExampleMeasures =>
  measures.reduce(
    (total, each) => ({
      length: total.length + each.length,
      capacity: total.capacity + each.capacity,
    }),
    { length: 0, capacity: 0 },
  );
