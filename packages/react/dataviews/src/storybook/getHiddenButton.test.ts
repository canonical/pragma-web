import { within } from "storybook/test";
import { afterEach, describe, expect, it } from "vitest";
import getHiddenButton from "./getHiddenButton.js";

/** A canvas over a fresh container holding this markup. */
const renderCanvas = (markup: string) => {
  const container = document.createElement("div");
  container.innerHTML = markup;
  document.body.append(container);
  return within(container);
};

afterEach(() => {
  document.body.replaceChildren();
});

describe("getHiddenButton", () => {
  it("finds a button the stylesheet hides by its text", () => {
    const canvas = renderCanvas(
      '<button type="submit" style="display: none">Apply</button><button type="button">Reset</button>',
    );
    const button = getHiddenButton(canvas, "Apply");
    expect(button.type).toBe("submit");
    expect(button.textContent).toBe("Apply");
  });

  it("passes over an element that only has the button role", () => {
    const canvas = renderCanvas(
      '<div role="button">Apply</div><button type="submit">Apply</button>',
    );
    expect(getHiddenButton(canvas, "Apply")).toBeInstanceOf(HTMLButtonElement);
  });

  it("throws when no button reads the label", () => {
    const canvas = renderCanvas('<button type="button">Reset</button>');
    expect(() => getHiddenButton(canvas, "Apply")).toThrow(
      'Expected one button reading "Apply", found 0',
    );
  });

  it("throws when more than one button reads the label", () => {
    const canvas = renderCanvas("<button>Apply</button><button>Apply</button>");
    expect(() => getHiddenButton(canvas, "Apply")).toThrow(
      'Expected one button reading "Apply", found 2',
    );
  });
});
