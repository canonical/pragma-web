import { describe, expect, it } from "vitest";
import {
  formatStoryName,
  readReactStories,
  readSvelteStories,
} from "./readStoryInventory.js";

describe("formatStoryName", () => {
  it("splits camel case and acronyms", () => {
    expect(formatStoryName("WithError")).toBe("With Error");
    expect(formatStoryName("Default")).toBe("Default");
    expect(formatStoryName("ISOValue")).toBe("ISO Value");
    expect(formatStoryName("Step_2")).toBe("Step 2");
  });
});

describe("readReactStories", () => {
  it("reads the title and each story, preferring a declared name", () => {
    const source = `const meta = { title: "components/X" };
export default meta;
export const Default: Story = { args: {} };
export const WithName: Story = {
  name: "Custom name",
  args: { name: "field" },
};
export const Inline = () => null;
`;
    expect(readReactStories(source)).toEqual({
      title: "components/X",
      names: ["Default", "Custom name", "Inline"],
    });
  });
});

describe("readSvelteStories", () => {
  it("reads the meta title and each story name", () => {
    const source = `<script module>
  const { Story } = defineMeta({ title: "components/X" });
</script>
<Story name="Default" />
<Story
  args={{ name: "a" }}
  name="With Error"
/>`;
    expect(readSvelteStories(source)).toEqual({
      title: "components/X",
      names: ["Default", "With Error"],
    });
  });
});
