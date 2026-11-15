import { BRIDGE_LANE } from "./constants.js";

/**
 * Offset a lane among `count` lanes spread about a run's middle within
 * `room` px: at most `BRIDGE_LANE` apart, an even number of px so every
 * offset is whole, and 0 for a lone lane.
 *
 * @param index - The lane's place among the lanes, from 0.
 * @param count - How many lanes share the run.
 * @param room - The room the lanes may spread over, in px.
 * @returns The lane's offset from the run's middle, in px.
 */
export default function offsetLane(
  index: number,
  count: number,
  room: number,
): number {
  if (count === 1) return 0;
  const step = Math.min(BRIDGE_LANE, 2 * Math.floor(room / (count - 1) / 2));
  return (index - (count - 1) / 2) * step;
}
