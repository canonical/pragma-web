// Scaffolded by @canonical/summon-component:react v0.46.0

import { renderToString } from "react-dom/server";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import { MESSAGES } from "#i18n";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import SearchPage from "./SearchPage.js";

describe("SearchPage SSR", () => {
  it("server-renders its heading, its count and each result with its passage", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        SearchConnection: () => ({ total: 1 }),
        SearchMatch: () => ({
          passage: "Northgate interchange",
          ranges: [{ start: 0, length: 9 }],
        }),
        Node: resolveRoot(MOCK_STATION),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <SearchPage text="northgate" />),
    );
    expect(html).toContain('class="ds search-page"');
    expect(html).toContain(`>${MESSAGES["search.title"]}</h1>`);
    expect(html).toContain("1 result");
    expect(html).toContain('class="ds search-passage passage"');
    expect(html).toContain('<mark class="match">Northgate</mark>');
  });
});
