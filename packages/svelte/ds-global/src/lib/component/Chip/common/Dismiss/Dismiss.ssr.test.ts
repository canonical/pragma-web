import { render } from "@canonical/svelte-ssr-test";
import type { ComponentProps } from "svelte";
import { describe, expect, it } from "vitest";
import Fixture from "../../test.fixtures.svelte";

describe("Chip.Dismiss SSR", () => {
  const baseProps = {
    dismissProps: { onclick: () => {} },
  } satisfies ComponentProps<typeof Fixture>;

  it("renders a non-submitting button inside the chip span", () => {
    const page = render(Fixture, { props: baseProps });
    const dismiss = page.getByRole("button", { name: "Dismiss Owner: Bob" });

    expect(dismiss).toBeInstanceOf(page.window.HTMLButtonElement);
    expect(dismiss.getAttribute("type")).toBe("button");
    expect(dismiss.closest(".ds.chip")?.tagName).toBe("SPAN");
  });

  it.each(["submit", "reset"] as const)(
    "accepts the native %s button type",
    (type) => {
      const page = render(Fixture, {
        props: {
          dismissProps: { ...baseProps.dismissProps, type },
        },
      });

      expect(page.getByRole("button").getAttribute("type")).toBe(type);
    },
  );

  describe("attributes", () => {
    it.each([
      ["id", "dismiss-bob"],
      ["aria-label", "Remove Bob"],
      ["aria-describedby", "dismiss-help"],
      ["name", "remove-owner"],
      ["value", "Bob"],
      ["tabindex", "-1"],
    ])("applies %s to the dismiss button", (attribute, expected) => {
      const page = render(Fixture, {
        props: {
          dismissProps: {
            ...baseProps.dismissProps,
            [attribute]: expected,
          },
        },
      });
      const dismiss = page.getByRole("button");

      expect(dismiss.getAttribute(attribute)).toBe(expected);
      expect(dismiss.closest(".ds.chip")?.getAttribute(attribute)).not.toBe(
        expected,
      );
    });

    it("merges custom classes with the dismiss class", () => {
      const page = render(Fixture, {
        props: {
          dismissProps: { ...baseProps.dismissProps, class: "custom-dismiss" },
        },
      });

      expect(page.getByRole("button").className).toBe("dismiss custom-dismiss");
    });

    it("applies native inline styles", () => {
      const page = render(Fixture, {
        props: {
          dismissProps: { ...baseProps.dismissProps, style: "color: orange;" },
        },
      });

      expect(page.getByRole("button").style.color).toBe("orange");
    });
  });

  it("keeps dismiss registration and accessible names local to each chip", () => {
    const page = render(Fixture, {
      props: { ...baseProps, secondChip: true },
    });
    const owner = page.getByRole("button", { name: "Dismiss Owner: Bob" });
    const reviewer = page.getByRole("button", {
      name: "Dismiss Reviewer: Alice",
    });

    expect(owner.closest(".ds.chip")).not.toBe(reviewer.closest(".ds.chip"));
    expect(owner.closest(".ds.chip")?.tagName).toBe("SPAN");
    expect(reviewer.closest(".ds.chip")?.tagName).toBe("SPAN");
  });
});
