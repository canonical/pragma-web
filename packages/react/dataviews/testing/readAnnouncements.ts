import { act } from "@testing-library/react";
import { vi } from "vitest";
import { COALESCE_DELAY_MS } from "../src/lib/common/index.js";

/**
 * What every announcer in the document has spoken, oldest first, once
 * what was said in the moment before has been spoken: each announcement's
 * text, in the order they were spoken.
 *
 * The test fakes the clock before anything is said (`fakeAnnouncerClock`),
 * so the announcer's short delay is advanced past, never waited out.
 *
 * @throws When the clock is real: a read would otherwise wait on it.
 * @note Impure: advances the faked clock inside `act`, so what was said has
 * reached the page.
 */
export default async function readAnnouncements(): Promise<readonly string[]> {
  if (!vi.isFakeTimers()) {
    throw new Error(
      "readAnnouncements needs a faked clock: call fakeAnnouncerClock() first",
    );
  }
  await act(async () => {
    await vi.advanceTimersByTimeAsync(COALESCE_DELAY_MS);
  });
  return Array.from(
    document.querySelectorAll(".ds.data-views-announcer > *"),
    (announcement) => announcement.textContent ?? "",
  );
}
