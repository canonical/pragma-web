import { describe, expect, it } from "vitest";
import { renderDecorated } from "../../../testing/index.js";
import withGridTrack from "./withGridTrack.js";

describe("withGridTrack", () => {
  it("renders the story in a one-track grid of the given width", () => {
    const track = renderDecorated(withGridTrack("20rem"));
    expect(track?.style.display).toBe("grid");
    expect(track?.style.gridTemplateColumns).toBe("1fr");
    expect(track?.style.width).toBe("20rem");
    expect(track?.style.height).toBe("");
  });

  it("gives the grid the height named", () => {
    const track = renderDecorated(withGridTrack("20rem", "40rem"));
    expect(track?.style.height).toBe("40rem");
  });
});
