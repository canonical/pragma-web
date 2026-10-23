import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createRouterHarness from "../../../../../../testing/createRouterHarness.js";
import type { ClassPropertyEntry } from "../../types.js";
import FieldList from "./FieldList.js";

describe("FieldList SSR", () => {
  it("renders a row per field", () => {
    const html = renderToString(
      createRouterHarness(
        <FieldList
          fields={[
            {
              required: false,
              singular: false,
              inherited: false,
              property: {
                uri: "https://ds.canonical.com/name",
                label: "name",
                definition: null,
                range: "http://www.w3.org/2001/XMLSchema#string",
                kind: "DATATYPE",
                domain: null,
              },
            } as ClassPropertyEntry,
          ]}
          namespaces={[
            { prefix: "ds", namespace: "https://ds.canonical.com/" },
          ]}
        />,
      ),
    );
    expect(html).toContain('class="ds field-list"');
    expect(html).toContain('href="/definitions/ds%3Aname"');
  });
});
