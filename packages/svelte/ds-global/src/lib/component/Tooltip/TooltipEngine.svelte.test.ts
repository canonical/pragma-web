import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import TooltipEngine from "./TooltipEngine.svelte";
import Wrapper from "./TooltipEngineTestWrapper.fixtures.svelte";
import {
  icon,
  message,
  messageText,
  target,
  targetText,
} from "./test.fixtures.svelte";

/** The tooltip root of the rendered message, wherever it was portalled. */
const tooltipOf = () =>
  document.querySelector(".ds.tooltip") as HTMLElement | null;

describe("TooltipEngine", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children inside the target span", async () => {
    const { container } = await render(TooltipEngine, {
      children: target,
      message,
    });
    const targetSpan = container.querySelector(".ds.tooltip-area > .target");
    expect(targetSpan?.textContent).toBe(targetText);
  });

  it("renders the tooltip message on hover", async () => {
    await render(TooltipEngine, { children: target, message });
    page
      .getByText(targetText)
      .element()
      .dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    expect(tooltipOf()?.textContent).toBe(messageText);
  });

  it("renders the tooltip message on focus, and hides it on blur", async () => {
    await render(Wrapper, { text: messageText });
    const button = page.getByRole("button");
    (button.element() as HTMLButtonElement).focus();
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    (button.element() as HTMLButtonElement).blur();
    await expect
      .poll(() => tooltipOf()?.getAttribute("aria-hidden"))
      .toBe("true");
    await expect.poll(() => tooltipOf()).not.toBeVisible();
  });

  it("hides the tooltip message on pointer leave", async () => {
    const { container } = await render(TooltipEngine, {
      children: target,
      message,
    });
    const area = container.querySelector(".ds.tooltip-area") as HTMLElement;
    area.dispatchEvent(new PointerEvent("pointerenter"));
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    area.dispatchEvent(new PointerEvent("pointerleave"));
    await expect
      .poll(() => tooltipOf()?.getAttribute("aria-hidden"))
      .toBe("true");
  });

  it("keeps the tooltip open while the pointer is over it", async () => {
    vi.useFakeTimers();
    const { container } = await render(TooltipEngine, {
      children: target,
      message,
    });
    const area = container.querySelector(".ds.tooltip-area") as HTMLElement;
    area.dispatchEvent(new PointerEvent("pointerenter"));
    await vi.advanceTimersByTimeAsync(150);
    area.dispatchEvent(new PointerEvent("pointerleave"));
    tooltipOf()?.dispatchEvent(new PointerEvent("pointerenter"));
    await vi.advanceTimersByTimeAsync(300);
    expect(tooltipOf()).toHaveAttribute("aria-hidden", "false");
  });

  it("associates the target with the tooltip", async () => {
    const { container } = await render(TooltipEngine, {
      children: target,
      message,
    });
    const targetSpan = container.querySelector(".target") as HTMLElement;
    const id = targetSpan.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(tooltipOf()?.id).toBe(id);
  });

  it("portals the message to document.body by default", async () => {
    const { container } = await render(TooltipEngine, {
      children: target,
      message,
    });
    expect(tooltipOf()?.parentElement).toBe(document.body);
    expect(container.querySelector(".ds.tooltip")).toBeNull();
  });

  it("portals the message to parentElement when given", async () => {
    const parentElement = document.createElement("section");
    document.body.append(parentElement);
    await render(TooltipEngine, { children: target, message, parentElement });
    expect(tooltipOf()?.parentElement).toBe(parentElement);
    parentElement.remove();
  });

  it("removes the portalled message when unmounted", async () => {
    const { unmount } = await render(TooltipEngine, {
      children: target,
      message,
    });
    expect(tooltipOf()).not.toBeNull();
    unmount();
    expect(tooltipOf()).toBeNull();
  });

  it("applies the area, target and message classes, styles and id", async () => {
    const { container } = await render(TooltipEngine, {
      children: target,
      message,
      open: true,
      class: "area-class",
      style: "color: rgb(0, 0, 255);",
      targetElementId: "target-id",
      targetElementClass: "target-class",
      targetElementStyle: "color: rgb(0, 128, 0);",
      messageElementClass: "test-message-class",
      messageElementStyle: "color: rgb(255, 0, 0);",
    });
    const area = container.querySelector(".ds.tooltip-area") as HTMLElement;
    expect(area).toHaveClass("area-class");
    expect(area).toHaveStyle("color: rgb(0, 0, 255)");
    const targetSpan = container.querySelector(".target") as HTMLElement;
    expect(targetSpan).toHaveAttribute("id", "target-id");
    expect(targetSpan).toHaveClass("target-class");
    expect(targetSpan).toHaveStyle("color: rgb(0, 128, 0)");
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    expect(tooltipOf()).toHaveClass("test-message-class");
    expect(tooltipOf()).toHaveStyle("color: rgb(255, 0, 0)");
  });

  it("does not couple the arrow size to the distance prop", async () => {
    await render(TooltipEngine, {
      children: target,
      message,
      open: true,
      distance: "10px",
    });
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    expect(
      tooltipOf()?.style.getPropertyValue("--tooltip-spacing-arrow-size"),
    ).toBe("");
  });

  it("renders the tooltip without the contrasted surface", async () => {
    await render(TooltipEngine, { children: target, message, open: true });
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    expect(tooltipOf()).not.toHaveClass("contrasted");
  });

  it("renders a leading icon", async () => {
    await render(TooltipEngine, {
      children: target,
      message,
      icon,
      open: true,
    });
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    expect(tooltipOf()?.querySelector(".icon > svg")).not.toBeNull();
  });

  it("caps the width at the tooltip max width by default", async () => {
    await render(TooltipEngine, { children: target, message, open: true });
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    expect(tooltipOf()?.style.maxWidth).toBe("var(--tooltip-max-width)");
    expect(getComputedStyle(tooltipOf() as Element).maxWidth).toBe("284px");
  });

  it("renders the message as a live snippet, reactive to prop changes", async () => {
    const { rerender } = await render(Wrapper, { text: "Collapse" });
    page
      .getByRole("button")
      .element()
      .dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await expect
      .element(page.getByRole("tooltip"))
      .toHaveTextContent("Collapse");
    await rerender({ text: "Expand" });
    await expect.element(page.getByRole("tooltip")).toHaveTextContent("Expand");
  });

  it("keeps the same target element identity across prop changes", async () => {
    const { container, rerender } = await render(Wrapper, {
      text: "Collapse",
      label: "expanded",
    });
    const before = container.querySelector(".ds.tooltip-area > .target");
    await rerender({ text: "Expand", label: "collapsed" });
    const after = container.querySelector(".ds.tooltip-area > .target");
    expect(after).toBe(before);
    expect(after?.textContent).toBe("collapsed");
  });

  it("resolves placement and reveals role='tooltip' on hover and focus when preferredDirections is explicit", async () => {
    await render(Wrapper, {
      text: "Positioned tooltip",
      preferredDirections: ["block-end"],
    });
    const button = page.getByRole("button");
    expect(tooltipOf()).toHaveAttribute("aria-hidden", "true");

    button
      .element()
      .dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    const tooltip = page.getByRole("tooltip");
    await expect.element(tooltip).toBeVisible();
    await expect.element(tooltip).toHaveAttribute("aria-hidden", "false");
    await expect.element(tooltip).toHaveClass("bottom");

    button
      .element()
      .dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
    await expect
      .poll(() => tooltipOf()?.getAttribute("aria-hidden"))
      .toBe("true");

    (button.element() as HTMLButtonElement).focus();
    await expect.element(tooltip).toBeVisible();
    await expect.element(tooltip).toHaveClass("bottom");
  });

  it("resolves placement and reveals role='tooltip' when controlled open with explicit preferredDirections", async () => {
    await render(Wrapper, {
      text: "Always open",
      open: true,
      preferredDirections: ["block-end"],
    });
    const tooltip = page.getByRole("tooltip");
    await expect.element(tooltip).toBeVisible();
    await expect.element(tooltip).toHaveAttribute("aria-hidden", "false");
    await expect.element(tooltip).toHaveClass("bottom");
  });

  it("points the arrow at the target and offsets the popup by the distance", async () => {
    await render(Wrapper, {
      text: "Arrow",
      open: true,
      preferredDirections: ["block-start"],
    });
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    const style = tooltipOf()?.style;
    expect(style?.getPropertyValue("--tooltip-arrow-offset-left")).toMatch(
      /px$/,
    );
    expect(style?.marginBottom).toBe("16px");
  });

  it("stays closed when controlled closed", async () => {
    vi.useFakeTimers();
    const { container } = await render(TooltipEngine, {
      children: target,
      message,
      open: false,
    });
    container
      .querySelector(".ds.tooltip-area")
      ?.dispatchEvent(new PointerEvent("pointerenter"));
    await vi.advanceTimersByTimeAsync(300);
    expect(tooltipOf()).toHaveAttribute("aria-hidden", "true");
  });
});
