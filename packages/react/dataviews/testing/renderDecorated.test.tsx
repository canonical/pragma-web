import type { Decorator } from "@storybook/react-vite";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import renderDecorated from "./renderDecorated.js";

/** A decorator that wraps the story in a section. */
const withSection: Decorator = (Story) => (
  <section>
    <Story />
  </section>
);

describe("renderDecorated", () => {
  it("answers the element the decorator wraps the story in", () => {
    expect(renderDecorated(withSection)?.tagName).toBe("SECTION");
  });

  it("renders the story given, answering null when it says no Story", () => {
    expect(renderDecorated(withSection, () => <hr />)).toBeNull();
    expect(screen.getByRole("separator").parentElement?.tagName).toBe(
      "SECTION",
    );
  });
});
