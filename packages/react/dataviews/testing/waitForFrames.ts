import { act } from "@testing-library/react";
import { vi } from "vitest";

/** How many frames a wait lasts before it fails: about a second. */
const FRAME_LIMIT = 60;

/** One frame's length, by which a faked clock is advanced. */
const FRAME_MS = 16;

/**
 * Waits frame by frame until `read` returns a value, and returns it. It
 * counts animation frames, advancing a faked clock by one frame each time.
 *
 * @param read Reads the awaited value, or null or undefined while it is not there.
 * @param awaited What is awaited, named in the error when it never comes.
 * @returns The value once `read` returns one.
 * @note Impure: waits on the animation frames, flushing React's updates.
 */
export default async function waitForFrames<TValue>(
  read: () => TValue | null | undefined,
  awaited: string,
): Promise<TValue> {
  for (let frame = 0; frame < FRAME_LIMIT; frame += 1) {
    const value = read();
    if (value !== null && value !== undefined) {
      return value;
    }
    await act(async () => {
      const painted = new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      // A faked clock drives a faked frame; a real frame comes on its own.
      if (vi.isFakeTimers()) {
        await vi.advanceTimersByTimeAsync(FRAME_MS);
      }
      await painted;
    });
  }
  throw new Error(`expected ${awaited} within ${FRAME_LIMIT} frames`);
}
