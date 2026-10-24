import { describe, expect, it } from "vitest";
import selectExemplars from "./selectExemplars.js";

/** An instance with a title and, optionally, a tier. */
const block = (uri: string, title: string | null, tier?: string) => ({
  uri,
  _meta: { title },
  tier: tier === undefined ? null : { name: tier },
});

describe("selectExemplars", () => {
  it("keeps one block per title, the global one where a title spans tiers", () => {
    const chosen = selectExemplars(
      [
        block("launchpad.accordion", "Accordion", "Apps/Launchpad"),
        block("global.accordion", "Accordion", "Global"),
        block("global.announcement", "Announcement", "Global"),
        block("launchpad.avatar", "Avatar", "Apps/Launchpad"),
        block("global.avatar", "Avatar", "Global"),
        block("lxd.back_link", "BackLink", "Apps/LXD"),
      ],
      6,
    );
    expect(chosen.map(({ uri }) => uri)).toEqual([
      "global.accordion",
      "global.announcement",
      "global.avatar",
      "lxd.back_link",
    ]);
  });

  it("keeps the first block of a title no global block carries", () => {
    const chosen = selectExemplars(
      [
        block("lxd.tabs", "Tabs", "Apps/LXD"),
        block("launchpad.tabs", "Tabs", "Apps/Launchpad"),
        block("untiered.tabs", "Tabs"),
      ],
      6,
    );
    expect(chosen.map(({ uri }) => uri)).toEqual(["lxd.tabs"]);
  });

  it("keeps a global block over a later one of the same title", () => {
    const chosen = selectExemplars(
      [
        block("global.chip", "Chip", "Global"),
        block("launchpad.chip", "Chip", "Apps/Launchpad"),
      ],
      6,
    );
    expect(chosen.map(({ uri }) => uri)).toEqual(["global.chip"]);
  });

  it("stops at the count and skips a block without a title", () => {
    const chosen = selectExemplars(
      [
        block("a", null, "Global"),
        block("b", "B", "Global"),
        block("c", "C", "Global"),
        block("d", "D", "Global"),
      ],
      2,
    );
    expect(chosen.map(({ uri }) => uri)).toEqual(["b", "c"]);
  });
});
