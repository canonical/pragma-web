import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ENTITY_TABLE_PROPS,
  THING_ROUTES,
} from "../../../../testing/fixtures.js";
import EntityTable from "./EntityTable.js";

describe("EntityTable SSR", () => {
  it("renders the header row and the rows on the server", () => {
    const html = renderToString(
      <RouterProvider
        router={createRouter(THING_ROUTES, {
          adapter: createMemoryAdapter("/"),
        })}
      >
        <EntityTable {...ENTITY_TABLE_PROPS} selected="b" />
      </RouterProvider>,
    );
    expect(html).toContain("ds entity-table");
    expect(html).toContain('<td class="value" data-property="servesLine">');
    expect(html).toContain('aria-selected="true"');
  });
});
