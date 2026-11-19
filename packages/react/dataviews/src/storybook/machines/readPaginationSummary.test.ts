import { within } from "storybook/test";
import { afterEach, describe, expect, it } from "vitest";
import readPaginationSummary from "./readPaginationSummary.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("readPaginationSummary", () => {
  it("reads the status inside the pagination bar, not a filter's", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <div role="status">3 statuses</div>
      <nav aria-label="Pagination"><p role="status">1–5 of 12</p></nav>`;
    document.body.append(container);
    expect(readPaginationSummary(within(container)).textContent).toBe(
      "1–5 of 12",
    );
  });
});
