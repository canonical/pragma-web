import type { Count } from "../src/lib/result/index.js";

/** A count claimed as a lower bound. */
export default function atLeast(value: number): Count {
  return { kind: "at-least", value };
}
