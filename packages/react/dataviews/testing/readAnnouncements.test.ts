import { afterEach, describe, expect, it, vi } from "vitest";
import { COALESCE_DELAY_MS } from "../src/lib/common/index.js";
import fakeAnnouncerClock from "./fakeAnnouncerClock.js";
import readAnnouncements from "./readAnnouncements.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("readAnnouncements", () => {
  it("refuses to read while the clock is real", async () => {
    await expect(readAnnouncements()).rejects.toThrow(
      "readAnnouncements needs a faked clock: call fakeAnnouncerClock() first",
    );
  });

  it("reads what every announcer spoke, oldest first", async () => {
    fakeAnnouncerClock();
    document.body.innerHTML = `
      <div class="ds data-views-announcer"><p>Sorted by name</p><p></p></div>
      <div class="data-views-announcer"><p>Not an announcer</p></div>
      <div class="ds data-views-announcer"><span>3 results</span></div>`;
    await expect(readAnnouncements()).resolves.toEqual([
      "Sorted by name",
      "",
      "3 results",
    ]);
  });

  it("reads an announcement with no text as empty", async () => {
    fakeAnnouncerClock();
    document.body.innerHTML =
      '<div class="ds data-views-announcer"><p>Hidden</p></div>';
    const announcement = document.querySelector("p");
    if (announcement !== null) {
      Object.defineProperty(announcement, "textContent", { value: null });
    }
    await expect(readAnnouncements()).resolves.toEqual([""]);
  });

  it("advances the clock past the announcer's delay before reading", async () => {
    fakeAnnouncerClock();
    const spoken = vi.fn(() => {
      document.body.innerHTML =
        '<div class="ds data-views-announcer"><p>Filtered</p></div>';
    });
    setTimeout(spoken, COALESCE_DELAY_MS);
    await expect(readAnnouncements()).resolves.toEqual(["Filtered"]);
    expect(spoken).toHaveBeenCalledTimes(1);
  });
});
