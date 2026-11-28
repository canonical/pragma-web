import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import TooltipEngine from "./TooltipEngine.svelte";
import {
  message,
  messageText,
  target,
  targetText,
} from "./test.fixtures.svelte";

/**
 * The server-rendered floor. The portalled message is deferred until after
 * mount, so the server HTML carries the target and its `aria-describedby`
 * association but not the message itself — the same output the first client
 * render produces, which is what keeps hydration free of mismatches.
 */
describe("TooltipEngine SSR", () => {
  it("renders to static HTML without throwing", () => {
    expect(() =>
      render(TooltipEngine, { props: { children: target, message } }),
    ).not.toThrow();
  });

  it("emits the target with aria-describedby but not the deferred message", () => {
    const page = render(TooltipEngine, {
      props: { children: target, message, open: true },
    });
    expect(page.container.innerHTML).toContain("ds tooltip-area");
    expect(page.container.innerHTML).toContain(targetText);
    expect(page.container.innerHTML).toContain("aria-describedby");
    // The message is portalled only after mount, so it must be absent on the
    // server — emitting it here would mismatch the first client render.
    expect(page.container.innerHTML).not.toContain(messageText);
    expect(page.container.querySelector("[role='tooltip']")).toBeNull();
  });

  it("matches the React markup of the area and target", () => {
    const page = render(TooltipEngine, {
      props: {
        children: target,
        message,
        class: "area",
        targetElementId: "target-id",
        targetElementClass: "extra",
      },
    });
    const area = page.container.querySelector(".ds.tooltip-area");
    const targetSpan = area?.firstElementChild;
    expect(area?.className).toBe("ds tooltip-area area");
    expect(targetSpan?.className).toBe("target extra");
    expect(targetSpan?.id).toBe("target-id");
    expect(targetSpan?.innerHTML.replace(/<!--[^>]*-->/g, "")).toBe(
      `<span>${targetText}</span>`,
    );
  });
});
