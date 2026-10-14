import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import { Chip } from "./index.js";
import Fixture, {
  customIcon,
  defaultDismiss,
  duplicateDismiss,
} from "./test.fixtures.svelte";
import type { ChipProps } from "./types.js";

describe("Chip SSR", () => {
  it("renders an actionable chip as a non-submitting button", () => {
    const page = render(Chip, {
      props: { value: "Ubuntu", onclick: () => {} },
    });
    const chip = page.getByRole("button", { name: "Ubuntu" });

    expect(chip.tagName).toBe("BUTTON");
    expect(chip?.getAttribute("type")).toBe("button");
    expect(page.getAllByRole("button")).toHaveLength(1);
    expect(chip?.className).toBe("ds chip");
    expect(chip?.hasAttribute("density")).toBe(false);
  });

  it.each(["submit", "reset"] as const)(
    "accepts the native %s button type",
    (type) => {
      const page = render(Chip, {
        props: { value: "Ubuntu", onclick: () => {}, type },
      });

      expect(
        page.getByRole("button", { name: "Ubuntu" }).getAttribute("type"),
      ).toBe(type);
    },
  );

  it("renders only the dismiss control for an applied value", () => {
    const page = render(Chip, {
      props: { lead: "Owner", value: "Bob", children: defaultDismiss },
    });
    const dismiss = page.getByRole("button", { name: "Dismiss Owner: Bob" });
    const chip = dismiss.parentElement;

    expect(chip?.tagName).toBe("SPAN");
    expect(chip?.className).toBe("ds chip");
    expect(chip?.hasAttribute("density")).toBe(false);
    expect(dismiss.getAttribute("aria-label")).toBe("Dismiss Owner: Bob");
    expect(page.getAllByRole("button")).toHaveLength(1);
    expect(dismiss.getAttribute("type")).toBe("button");
  });

  it("uses the value alone in the default dismiss name when there is no lead", () => {
    const page = render(Chip, {
      props: { value: "Ubuntu", children: defaultDismiss },
    });

    expect(page.getByRole("button").getAttribute("aria-label")).toBe(
      "Dismiss Ubuntu",
    );
  });

  it("forwards native dismiss props and allows custom content on the server", () => {
    const page = render(Fixture, {
      props: {
        dismissProps: {
          onclick: () => {},
          disabled: true,
          class: "custom-dismiss",
          title: "Remove owner",
          "aria-label": "Remove Bob",
          children: customIcon,
          type: "submit",
        },
      },
    });
    const dismiss = page.getByRole("button", { name: "Remove Bob" });
    const root = dismiss.parentElement;

    expect(root?.tagName).toBe("SPAN");
    expect(root?.classList.contains("custom-chip")).toBe(true);
    expect(root?.hasAttribute("disabled")).toBe(false);
    expect(root?.hasAttribute("title")).toBe(false);
    expect(dismiss.className).toBe("dismiss custom-dismiss");
    expect(dismiss.getAttribute("aria-label")).toBe("Remove Bob");
    expect(dismiss.getAttribute("title")).toBe("Remove owner");
    expect(dismiss.getAttribute("type")).toBe("submit");
    expect(dismiss.hasAttribute("disabled")).toBe(true);
    expect(dismiss.contains(page.getByTestId("custom-icon"))).toBe(true);
    expect(dismiss.querySelector("svg")).toBeNull();
  });

  it("rejects multiple dismiss controls", () => {
    expect(() =>
      render(Chip, {
        props: { value: "Ubuntu", children: duplicateDismiss },
      }),
    ).toThrow("Chip supports exactly one Chip.Dismiss");
  });

  it("rejects a dismiss control outside a chip", () => {
    expect(() =>
      render(Chip.Dismiss, { props: { onclick: () => {} } }),
    ).toThrow();
  });

  it("rejects chips with no action or conflicting actions at runtime", () => {
    for (const props of [
      { value: "Ubuntu" },
      { value: "Ubuntu", onclick: () => {}, children: defaultDismiss },
    ]) {
      expect(() =>
        render(Chip, { props: props as unknown as ChipProps }),
      ).toThrow("Chip requires exactly one of onclick or children");
    }
  });

  it("rejects dismiss controls supplied through an action chip's icon", () => {
    expect(() =>
      render(Chip, {
        props: { value: "Ubuntu", onclick: () => {}, icon: defaultDismiss },
      }),
    ).toThrow("Chip cannot have both onclick and Chip.Dismiss");
  });
});
