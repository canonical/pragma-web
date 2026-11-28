import { vi } from "vitest";
import { createMachineSource } from "../src/storybook/machines/index.js";
import type { CuedSource } from "./types.js";

/** A machine source whose requests deliver only when the test sends. */
export default function createCuedSource(): CuedSource {
  const deliver: CuedSource["send"][] = [];
  const stop = vi.fn<() => void>();
  return {
    source: {
      ...createMachineSource(),
      execute: (_request, onDelivery) => {
        deliver.push(onDelivery);
        return stop;
      },
    },
    send: (delivery) => {
      for (const onDelivery of deliver) {
        onDelivery(delivery);
      }
    },
    stop,
  };
}
