import { describe, expect, it } from "vitest";
import observeUntilFinished from "./observeUntilFinished.js";

/** How often the first test's observation was released. */
let releases = 0;

/** Release the observation, counting it. */
const release = (): void => {
  releases += 1;
};

describe("observeUntilFinished", () => {
  it("observes and answers the release", () => {
    expect(observeUntilFinished({ observe: () => release })).toBe(release);
    expect(releases).toBe(0);
  });

  it("released once the test before it ended", () => {
    expect(releases).toBe(1);
  });
});
