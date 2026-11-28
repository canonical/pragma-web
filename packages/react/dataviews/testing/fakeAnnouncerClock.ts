import { installFakeClock } from "@canonical/dataviews-core/testing";

/**
 * Fake the announcer's timers for the running test.
 *
 * @note Impure: fakes the timers until the running test finishes.
 */
export default function fakeAnnouncerClock(): void {
  installFakeClock(["setTimeout", "clearTimeout"]);
}
