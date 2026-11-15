import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../../testing/createFetchSpy.js";
import componentEntityRecordsButton from "../../../../__fixtures__/componentEntityRecordsButton.js";
import {
  BUTTON_URI,
  entityPageAt,
} from "../../../../__fixtures__/entityPageHarness.js";

describe("ComponentTokens SSR", () => {
  it("server-renders the tokens section's table", () => {
    const html = renderToString(
      entityPageAt(BUTTON_URI, componentEntityRecordsButton, createFetchSpy()),
    );
    expect(html).toContain('<div class="ds component-tokens">');
    expect(html).toContain('<h2 class="heading" id="tokens">');
    expect(html).toContain('<td class="symbol">modifier.color.icon</td>');
  });
});
