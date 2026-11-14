import type { Decorator } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import renderDecorated from "./renderDecorated.js";

describe("renderDecorated", () => {
  it("answers the element the decorator wraps the story in", () => {
    const decorator: Decorator = (Story) => (
      <section>
        <Story />
      </section>
    );
    expect(renderDecorated(decorator)?.tagName).toBe("SECTION");
  });
});
