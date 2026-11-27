import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { storyFilePairs, svelteOnlyStories } from "../fixtures.storyParity.js";
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
      const { title, names } = readSvelteStories(
        readFileSync(new URL(svelte, svelteSource), "utf8"),
      );
      const extras = svelteOnlyStories[svelte] ?? [];
      expect(names.slice(names.length - extras.length)).toEqual(extras);
      expect({
        title,
        names: names.slice(0, names.length - extras.length),
      }).toEqual(expected);
    },
  );
});
