import { afterEach, describe, expect, it, vi } from "vitest";
import toggleDisclosure from "./toggleDisclosure.js";

/** A container in the document holding this markup. */
const renderMarkup = (markup: string): HTMLElement => {
  const container = document.createElement("div");
  container.innerHTML = markup;
  document.body.append(container);
  return container;
};

afterEach(() => {
  document.body.replaceChildren();
});

describe("toggleDisclosure", () => {
  it("opens and closes the disclosure, settling once its toggle event arrives", async () => {
    const container = renderMarkup(
      "<details><summary>More</summary><p>Hidden</p></details>",
    );
    const details = container.querySelector("details");
    const toggled = vi.fn();
    details?.addEventListener("toggle", () => toggled(details.open));
    await toggleDisclosure(container, true);
    expect(toggled).toHaveBeenLastCalledWith(true);
    await toggleDisclosure(container, false);
    expect(toggled).toHaveBeenLastCalledWith(false);
    expect(toggled).toHaveBeenCalledTimes(2);
  });

  it("throws when the container holds no disclosure", async () => {
    await expect(
      toggleDisclosure(renderMarkup("<p>Plain</p>"), true),
    ).rejects.toThrow("expected a disclosure in the container");
  });
});
