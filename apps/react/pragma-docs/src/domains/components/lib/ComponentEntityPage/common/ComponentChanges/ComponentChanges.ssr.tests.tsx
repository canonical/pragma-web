import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../../testing/createFetchSpy.js";
import componentEntityRecordsButton from "../../../../__fixtures__/componentEntityRecordsButton.js";
import {
  BUTTON_URI,
  entityPageAt,
} from "../../../../__fixtures__/entityPageHarness.js";

describe("ComponentChanges SSR", () => {
  it("server-renders the changes section", () => {
    const html = renderToString(
      entityPageAt(BUTTON_URI, componentEntityRecordsButton, createFetchSpy()),
    );
    expect(html).toContain('<ol class="ds component-changes">');
    expect(html).toContain('<h2 class="heading" id="changes">');
  });
});
