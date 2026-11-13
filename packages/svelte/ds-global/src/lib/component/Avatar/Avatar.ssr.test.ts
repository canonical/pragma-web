import { type RenderResult, render } from "@canonical/svelte-ssr-test";
import type { ComponentProps } from "svelte";
import { describe, expect, it } from "vitest";
import Component from "./Avatar.svelte";

describe("Avatar SSR", () => {
  const src = "https://assets.ubuntu.com/v1/fca94c45-snap+icon.png";

  const baseProps = {
    "data-testid": "avatar",
  } satisfies ComponentProps<typeof Component>;

  describe("renders as <img>", () => {
    it("when src and name are provided", () => {
      const page = render(Component, {
        props: {
          ...baseProps,
          src,
          name: "John Doe",
        },
      });

      expectIs("img", page);

      const element = page.getByRole("img");
      expect(element.getAttribute("src")).toBe(src);
      expect(element.getAttribute("title")).toBe("John Doe");
      expect(element.getAttribute("data-initials")).toBeTruthy();
    });

    it("when src is provided without name", () => {
      const page = render(Component, {
        props: {
          ...baseProps,
          src,
        },
      });

      expectIs("img", page);

      const element = page.getByRole("img");
      expect(element).toBeInstanceOf(page.window.HTMLImageElement);
      expect(element.getAttribute("src")).toBe(src);
      expect(element.getAttribute("title")).toBeNull();
      expect(element.getAttribute("data-initials")).toBeNull();
    });
  });

  describe("renders as <abbr>", () => {
    it("when name is provided without src", () => {
      const page = render(Component, {
        props: {
          ...baseProps,
          name: "John Doe",
        },
      });

      expectIs("abbr", page);

      const element = page.getByTestId("avatar");
      expect(element.tagName).toBe("ABBR");
      expect(element.getAttribute("title")).toBe("John Doe");
      expect(element.textContent).toBe("JD");
    });

    it("when src is an empty string and name is provided", () => {
      const page = render(Component, {
        props: {
          ...baseProps,
          src: "",
          name: "John Doe",
        },
      });

      expectIs("abbr", page);

      const element = page.getByTestId("avatar");
      expect(element.tagName).toBe("ABBR");
      expect(element.getAttribute("title")).toBe("John Doe");
      expect(element.textContent).toBe("JD");
    });
  });

  describe("renders as icon", () => {
    it("when no user data is provided", () => {
      const page = render(Component, { props: { ...baseProps } });

      expectIs("svg", page);
    });

    it("when name is an empty string", () => {
      const page = render(Component, {
        props: {
          ...baseProps,
          name: "",
        },
      });

      expectIs("svg", page);
    });
  });

  describe("imageAttributes", () => {
    it("applies img-specific attributes to the avatar image", () => {
      const page = render(Component, {
        props: {
          ...baseProps,
          src: src,
          imageAttributes: { alt: "John Doe's avatar", loading: "lazy" },
        },
      });

      const element = page.getByRole("img");
      expect(element.getAttribute("alt")).toBe("John Doe's avatar");
      expect(element.getAttribute("loading")).toBe("lazy");
    });

    it("are not applied when rendering as <abbr>", () => {
      const page = render(Component, {
        props: {
          ...baseProps,
          name: "John Doe",
          imageAttributes: { alt: "John Doe's avatar", loading: "lazy" },
        },
      });

      const element = page.getByTestId("avatar");
      expect(element.tagName).toBe("ABBR");
      expect(element.getAttribute("alt")).toBeNull();
      expect(element.getAttribute("loading")).toBeNull();
    });

    it("are not applied when rendering as icon", () => {
      const page = render(Component, {
        props: {
          ...baseProps,
          imageAttributes: { alt: "John Doe's avatar", loading: "lazy" },
        },
      });

      const element = page.getByTestId("avatar");
      expect(element.tagName).toBe("DIV");
      expect(element.getAttribute("alt")).toBeNull();
      expect(element.getAttribute("loading")).toBeNull();
    });
  });

  describe("fallback behaviors", () => {
    it("includes CSS fallback hooks for no-JS image failure when userName is provided", () => {
      const page = render(Component, {
        props: {
          ...baseProps,
          src,
          name: "John Doe",
        },
      });
      const element = page.getByRole("img");

      expect(element.getAttribute("data-initials")).toBeTruthy();
      expect(element.getAttribute("title")).toBe("John Doe");
    });

    it("does not have icon fallback hooks for no-JS image failure without userName", () => {
      const page = render(Component, {
        props: {
          ...baseProps,
          src,
        },
      });
      const element = page.getByRole("img");

      expect(element.getAttribute("data-initials")).toBeNull();
      expect(page.getByTestId("avatar").querySelector("abbr")).toBeNull();
    });
  });
});

const elements = ["img", "abbr", "svg"] as const;

function expectIs(element: (typeof elements)[number], page: RenderResult) {
  for (const el of elements) {
    if (el === element) {
      expect(page.container.querySelector(el)).toBeTruthy();
    } else {
      expect(page.container.querySelector(el)).toBeNull();
    }
  }
}
