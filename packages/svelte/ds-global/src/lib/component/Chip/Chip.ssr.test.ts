import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Chip from "./Chip.svelte";

describe("Chip SSR", () => {
  it("renders an actionable chip as a non-submitting button", () => {
    const page = render(Chip, {
      props: { value: "Ubuntu", onclick: () => {} },
    });
    const chip = page.container.querySelector(".ds.chip");

    expect(chip?.tagName).toBe("BUTTON");
    expect(chip?.getAttribute("type")).toBe("button");
    expect(chip?.querySelector("button")).toBeNull();
    expect(chip?.className).toBe("ds chip");
    expect(chip?.hasAttribute("density")).toBe(false);
  });

  it.each(["submit", "reset"] as const)(
    "ignores the native %s button type",
    (type) => {
      const page = render(Chip, {
        props: { value: "Ubuntu", onclick: () => {}, type },
      });

      expect(
        page.container.querySelector(".ds.chip")?.getAttribute("type"),
      ).toBe("button");
    },
  );

  it("renders only the dismiss control for an applied value", () => {
    const page = render(Chip, {
      props: { lead: "Owner", value: "Bob", ondismiss: () => {} },
    });
    const chip = page.container.querySelector(".ds.chip");

    expect(chip?.tagName).toBe("SPAN");
    expect(chip?.className).toBe("ds chip");
    expect(chip?.hasAttribute("density")).toBe(false);
    expect(chip?.querySelector("button")?.getAttribute("aria-label")).toBe(
      "Dismiss Owner: Bob",
    );
  });
});
