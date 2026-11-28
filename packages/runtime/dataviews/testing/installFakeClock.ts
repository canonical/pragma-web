import { onTestFinished, vi } from "vitest";

type FakedClock = NonNullable<
  NonNullable<Parameters<typeof vi.useFakeTimers>[0]>["toFake"]
>;

/**
 * Fake the clock for one test and restore it when the test ends. Fakes
 * `setTimeout`, `clearTimeout` and `Date` unless told otherwise; `"every"`
 * fakes what a bare `vi.useFakeTimers()` does.
 *
 * @note Impure: replaces the clock's globals until the test ends.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function installFakeClock(
  toFake: FakedClock | "every" = ["setTimeout", "clearTimeout", "Date"],
): void {
  // biome-ignore lint/plugin/no-clock-waits: the one place a clock is faked
  vi.useFakeTimers(toFake === "every" ? {} : { toFake });
  onTestFinished(() => {
    vi.useRealTimers();
  });
}
