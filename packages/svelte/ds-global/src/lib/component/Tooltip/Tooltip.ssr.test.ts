import type { RenderResult } from "@canonical/svelte-ssr-test";
import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Tooltip from "./Tooltip.svelte";
import { children, childrenLabel } from "./test.fixtures.svelte";

describe("Tooltip SSR", () => {
  it.each([
    ["left", "right"],
    ["right", "left"],
    ["up", "bottom"],
    ["down", "top"],
  ] as const)("maps the %s arrow to the %s placement", (arrow, placement) => {
    const page = render(Tooltip, { props: { children, arrow } });
    expect(componentLocator(page).getAttribute("data-placement")).toBe(
      placement,
    );
  });

  it("renders independently with native attributes and content", () => {
    const page = render(Tooltip, {
      props: { children, id: "message", class: "custom", isOpen: true },
    });
    const tooltip = componentLocator(page);
    expect(tooltip.id).toBe("message");
    expect(tooltip.classList).toContain("custom");
    expect(tooltip.textContent).toContain(childrenLabel);
    expect(tooltip.getAttribute("data-open")).toBe("true");
    expect(tooltip.getAttribute("aria-hidden")).toBe("false");
  });

  it("is hidden by default", () => {
    const page = render(Tooltip, { props: { children } });
    expect(componentLocator(page).getAttribute("aria-hidden")).toBe("true");
  });
});

function componentLocator(page: RenderResult): HTMLElement {
  return page.getByRole("tooltip", { hidden: true });
}
