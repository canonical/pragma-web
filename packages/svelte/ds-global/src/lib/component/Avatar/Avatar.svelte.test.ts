import type { ComponentProps } from "svelte";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-svelte";
import Component from "./Avatar.svelte";

describe("Avatar component", () => {
  const src = "https://assets.ubuntu.com/v1/fca94c45-snap+icon.png";

  const baseProps = {
    "data-testid": "avatar",
  } satisfies ComponentProps<typeof Component>;

  describe("basics", () => {
    it("renders", async () => {
      const page = await render(Component, { ...baseProps });
      await expect.element(page.getByTestId("avatar")).toBeVisible();
    });
  });

  describe("attributes", () => {
    it.each([
      ["id", "test-id"],
      ["aria-label", "test-aria-label"],
    ])("applies %s", async (attribute, expected) => {
      const page = await render(Component, {
        ...baseProps,
        [attribute]: expected,
      });
      await expect
        .element(page.getByTestId("avatar"))
        .toHaveAttribute(attribute, expected);
    });

    it("applies classes", async () => {
      const page = await render(Component, {
        ...baseProps,
        class: "test-class",
      });
      const element = page.getByTestId("avatar");
      await expect.element(element).toHaveClass("test-class");
      await expect.element(element).toHaveClass("ds");
      await expect.element(element).toHaveClass("avatar");
    });

    it("applies style", async () => {
      const page = await render(Component, {
        ...baseProps,
        style: "color: orange;",
      });
      await expect
        .element(page.getByTestId("avatar"))
        .toHaveStyle({ color: "orange" });
    });
  });

  describe("renders as <img>", () => {
    it("when src and name are provided", async () => {
      const page = await render(Component, {
        ...baseProps,
        src,
        name: "John Doe",
      });

      await expectIs("img", page);

      const element = page.getByRole("img");
      await expect.element(element).toBeVisible();
      await expect.element(element).toHaveAttribute("src", src);
      await expect.element(element).toHaveAttribute("title", "John Doe");
      await expect.element(element).toHaveAttribute("data-initials");
    });

    it("when src is provided without name", async () => {
      const page = await render(Component, {
        ...baseProps,
        src,
      });

      await expectIs("img", page);

      const element = page.getByRole("img");
      await expect.element(element).toBeVisible();
      await expect.element(element).toHaveAttribute("src", src);
      await expect.element(element).not.toHaveAttribute("title");
      await expect.element(element).not.toHaveAttribute("data-initials");
    });
  });

  describe("renders as <abbr>", () => {
    it("when name is provided without src", async () => {
      const page = await render(Component, {
        ...baseProps,
        name: "John Doe",
      });

      await expectIs("abbr", page);
      await expect.element(page.getByTitle("John Doe")).toBeVisible();
    });
  });

  describe("renders as icon", () => {
    it("when no user data is provided", async () => {
      const page = await render(Component, { ...baseProps });

      await expectIs("svg", page);
    });
  });

  describe("imageAttributes", () => {
    it("applies img-specific attributes to the avatar image", async () => {
      const page = await render(Component, {
        ...baseProps,
        src,
        imageAttributes: { alt: "John Doe's avatar", loading: "lazy" },
      });

      const element = page.getByRole("img");
      await expect.element(element).toHaveAttribute("alt", "John Doe's avatar");
      await expect.element(element).toHaveAttribute("loading", "lazy");
    });

    it("are not applied when rendering as <abbr>", async () => {
      const page = await render(Component, {
        ...baseProps,
        name: "John Doe",
        imageAttributes: { alt: "John Doe's avatar", loading: "lazy" },
      });

      await expectIs("abbr", page);
      const element = page.getByTestId("avatar");
      await expect.element(element).not.toHaveAttribute("alt");
      await expect.element(element).not.toHaveAttribute("loading");
    });

    it("are not applied when rendering as icon", async () => {
      const page = await render(Component, {
        ...baseProps,
        imageAttributes: { alt: "John Doe's avatar", loading: "lazy" },
      });

      await expectIs("svg", page);
      const element = page.getByTestId("avatar");
      await expect.element(element).not.toHaveAttribute("alt");
      await expect.element(element).not.toHaveAttribute("loading");
    });
  });

  describe("fallback behaviors", () => {
    it("falls back to <abbr> when JS handles image error and name is provided", async () => {
      const page = await render(Component, {
        ...baseProps,
        src: "invalid-url",
        name: "John Doe",
      });

      const imageElement = page.getByRole("img");
      imageElement.element().dispatchEvent(new Event("error"));

      await expectIs("abbr", page);
      await expect.element(page.getByTitle("John Doe")).toBeVisible();
    });

    it("falls back to icon when JS handles image error and name is missing", async () => {
      const page = await render(Component, {
        ...baseProps,
        src: "invalid-url",
      });

      const imageElement = page.getByRole("img");
      imageElement.element().dispatchEvent(new Event("error"));

      await expectIs("svg", page);
    });

    it("keeps rendering as <img> in no-JS when name is provided", async () => {
      const page = await render(Component, {
        ...baseProps,
        src: `invalid-url`,
        name: "John Doe",
        onerror: () => {},
      });

      const imageElement = page.getByRole("img");
      imageElement.element().dispatchEvent(new Event("error"));

      await expect.element(imageElement).toHaveAttribute("data-initials");
      await expect.element(imageElement).toBeVisible();
    });

    it("keeps rendering as <img> in no-JS without name", async () => {
      const page = await render(Component, {
        ...baseProps,
        src: "invalid-url",
        onerror: () => {},
      });

      const imageElement = page.getByRole("img");
      imageElement.element().dispatchEvent(new Event("error"));

      await expect.element(imageElement).not.toHaveAttribute("data-initials");
      await expect.element(imageElement).toBeVisible();
    });
  });

  describe("modifiers", () => {
    const sizeModifiers = ["small", "large"] as const;

    it.each(sizeModifiers)("applies %s modifier", async (size) => {
      const page = await render(Component, {
        ...baseProps,
        size,
      });
      const element = page.getByTestId("avatar");
      const classList = element.element().classList;

      expect(classList.contains(size)).toBe(true);
      sizeModifiers.forEach((s) => {
        if (s !== size) {
          expect(classList.contains(s)).toBe(false);
        }
      });
    });
  });
});

const elements = ["img", "abbr", "svg"] as const;

async function expectIs(
  element: (typeof elements)[number],
  page: Awaited<ReturnType<typeof render>>,
) {
  const rootLocator = page.getByTestId("avatar");

  // Check the presence of the expected element
  if (element === "svg") {
    // Actual root is a div
    await expect.element(rootLocator).toHaveProperty("tagName", "DIV");
    expect(rootLocator.element().querySelector("svg")).toBeTruthy();
  } else {
    await expect
      .element(rootLocator)
      .toHaveProperty("tagName", element.toUpperCase());
  }

  // Ensure the other element types are not present
  elements
    .filter((e) => e !== element)
    .forEach((e) => {
      // Using `querySelector` is acceptable here as we guard DOM being settled on the locators above.
      expect(page.container.querySelector(e)).toBeNull();
    });
}
