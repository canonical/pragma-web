import { afterEach, describe, expect, it } from "vitest";
import expectNoAxeViolations from "./expectNoAxeViolations.js";

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

describe("expectNoAxeViolations", () => {
  it("passes a fragment with no landmarks and no contrast to measure", async () => {
    await expectNoAxeViolations(
      renderMarkup(
        '<p style="color: #eee; background: #fff">Low contrast</p><button type="button">Apply</button>',
      ),
    );
  });

  it("fails naming each broken rule and where it is broken", async () => {
    const container = renderMarkup(
      '<img id="logo" src="logo.png"><button id="empty" type="button"></button>',
    );
    const failure = await expectNoAxeViolations(container).then(
      () => null,
      (error: unknown) => error,
    );
    expect(failure).toMatchObject({
      actual: [
        { rule: "button-name", targets: ["#empty"] },
        { rule: "image-alt", targets: ["#logo"] },
      ],
    });
  });
});
