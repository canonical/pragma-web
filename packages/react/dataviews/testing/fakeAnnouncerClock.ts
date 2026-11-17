import { onTestFinished, vi } from "vitest";

/**
 * Fake the clock the announcer waits on, for the rest of the running test,
 * so `readAnnouncements` advances past its short delay instead of waiting
 * it out. Only `setTimeout` and `clearTimeout` are faked: rendering, focus
 * and the menus' own scheduling keep the real clock.
 *
 * @note Impure: fakes the timers until the running test finishes.
 */
export default function fakeAnnouncerClock(): void {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
}
