import type { RenderResult } from "@canonical/svelte-ssr-test";
import { render } from "@canonical/svelte-ssr-test";
import type { ComponentProps } from "svelte";
import { describe, expect, it } from "vitest";
import Component from "./SegmentedControl.svelte";

describe("SegmentedControl SSR", () => {
  const baseProps = {
    "aria-label": "Directory scope",
    "data-testid": "segmented-control",
    items: [
      { label: "My direct reports", value: "direct" },
      { label: "My span of control", value: "span" },
    ],
    value: "direct",
  } satisfies ComponentProps<typeof Component>;

  it("doesn't throw", () => {
    expect(() => render(Component, { props: { ...baseProps } })).not.toThrow();
  });

  it("renders the tablist and selected item", () => {
    const page = render(Component, { props: { ...baseProps } });
    const tablist = page.getByRole("tablist", { name: "Directory scope" });
    const selected = page.getByRole("tab", { name: "My direct reports" });

    expect(tablist).toBeInstanceOf(page.window.HTMLElement);
    expect(selected.getAttribute("aria-selected")).toBe("true");
    expect(selected.getAttribute("tabindex")).toBe("0");
  });

  it("renders root classes and passes through attributes", () => {
    const page = render(Component, {
      props: { ...baseProps, class: "custom" },
    });
    const root = componentLocator(page);

    expect(root.classList).toContain("ds");
    expect(root.classList).toContain("segmented-control");
    expect(root.classList).toContain("custom");
    expect(root.dataset.testid).toBe("segmented-control");
  });

  it("selects the first enabled segment when the value is missing or unavailable", () => {
    for (const value of [undefined, "missing", "disabled"]) {
      const page = render(Component, {
        props: {
          ...baseProps,
          value,
          items: [
            { label: "Unavailable", value: "disabled", disabled: true },
            ...baseProps.items,
          ],
        },
      });
      expect(
        page
          .getByRole("tab", { name: "My direct reports" })
          .getAttribute("aria-selected"),
      ).toBe("true");
      expect(
        page.getByRole("tab", { name: "Unavailable" }).getAttribute("tabindex"),
      ).toBe("-1");
    }
  });

  it("supports empty and fully disabled controls without a tab stop", () => {
    for (const items of [
      [],
      baseProps.items.map((item) => ({ ...item, disabled: true })),
    ]) {
      const page = render(Component, { props: { ...baseProps, items } });
      expect(page.container.querySelector('[tabindex="0"]')).toBeNull();
      expect(page.container.querySelector('[aria-selected="true"]')).toBeNull();
    }
  });
});

function componentLocator(page: RenderResult): HTMLDivElement {
  return page.container.querySelector(
    ".ds.segmented-control",
  ) as HTMLDivElement;
}
