import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { storyFilePairs } from "../fixtures.storyParity.js";
import { readReactStories, readSvelteStories } from "../readStoryInventory.js";

const reactSource = new URL(
  "../../../../../react/ds-global-form/src/",
  import.meta.url,
);
const svelteSource = new URL("../../", import.meta.url);

describe("Story parity with the React form package", () => {
  it.each(storyFilePairs)(
    "%s has the same title and stories as %s",
    (react, svelte) => {
      const expected = readReactStories(
        readFileSync(new URL(react, reactSource), "utf8"),
      );
      const actual = readSvelteStories(
        readFileSync(new URL(svelte, svelteSource), "utf8"),
      );
      expect(actual).toEqual(expected);
    },
  );
});
