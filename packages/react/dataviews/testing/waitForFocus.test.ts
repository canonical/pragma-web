import { afterEach, describe, expect, it } from "vitest";
import waitForFocus from "./waitForFocus.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("waitForFocus", () => {
  it("settles once the element holds focus", async () => {
    const button = document.createElement("button");
    document.body.append(button);
    requestAnimationFrame(() => button.focus());
    await waitForFocus(button);
    expect(document.activeElement).toBe(button);
  });

  it("fails when focus never arrives", async () => {
    const button = document.createElement("button");
    document.body.append(button);
    await expect(waitForFocus(button)).rejects.toThrow(
      "expected focus on the element within 60 frames",
    );
  });
});
