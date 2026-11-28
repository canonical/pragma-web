import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Tooltip from "./Tooltip.svelte";
import { content, contentText, icon } from "./test.fixtures.svelte";

/** The server markup, without Svelte's hydration comments. */
const html = (...args: Parameters<typeof render>): string =>
  render(...args).container.innerHTML.replace(/<!--[^>]*-->/g, "");

describe("Tooltip SSR", () => {
  it("renders the message bubble on the server without throwing", () => {
    const body = html(Tooltip, {
      props: { children: content, isOpen: true },
    });
    expect(body).toContain("ds tooltip");
    expect(body).toContain(contentText);
  });

  it("carries the open/closed aria state into the server markup", () => {
    const open = html(Tooltip, {
      props: { children: content, isOpen: true },
    });
    expect(open).toContain('aria-hidden="false"');

    const closed = html(Tooltip, { props: { children: content } });
    expect(closed).toContain('aria-hidden="true"');
  });

  it("renders the icon and text rows", () => {
    const page = render(Tooltip, {
      props: { children: content, icon, isOpen: true, zIndex: 3 },
    });
    const tooltip = page.getByRole("tooltip");
    expect(tooltip.getAttribute("role")).toBe("tooltip");
    expect(tooltip.style.visibility).toBe("visible");
    expect(tooltip.style.zIndex).toBe("3");
    expect(tooltip.querySelector(".content > .icon > svg")).not.toBeNull();
    expect(tooltip.querySelector(".content > .text")?.textContent).toBe(
      contentText,
    );
  });
});
