import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../../testing/createFetchSpy.js";
import componentEntityRecordsButton from "../../../../__fixtures__/componentEntityRecordsButton.js";
import {
  BUTTON_URI,
  entityPageAt,
} from "../../../../__fixtures__/entityPageHarness.js";

describe("ComponentVariants SSR", () => {
  it("server-renders the variants section with its cells", () => {
    const html = renderToString(
      entityPageAt(BUTTON_URI, componentEntityRecordsButton, createFetchSpy()),
    );
    expect(html).toContain('<ul class="ds component-variants">');
    expect(html).toContain('<h2 class="heading" id="variants">');
    expect(html).toContain(
      '<li class="cell" data-family="importance" data-modifier="secondary">',
    );
  });
});
